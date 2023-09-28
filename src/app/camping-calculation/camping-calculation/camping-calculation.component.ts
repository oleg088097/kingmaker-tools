import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { type CampingCalculationModuleState } from '../+state/+module-state';
import {
  CampingCalculationActions,
  campingCalculationFeature,
  type CampingCalculationState,
  type CampingData,
  type CampingDataCheck,
  type CheckDescriptionOptionalDc,
} from '../+state/camping-calculation.state';
import { CheckPerformerService, type CheckResult } from '../../shared/services';
import { DestroyService } from '../../utils/destroy.service';

@Component({
  selector: 'app-camping-calculation',
  templateUrl: './camping-calculation.component.html',
  styleUrls: ['./camping-calculation.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampingCalculationComponent {
  protected destroy$ = inject(DestroyService);
  protected dcFormControl = new FormControl<number>(0, {
    nonNullable: true,
    validators: Validators.required,
  });

  protected loading: WritableSignal<boolean> = signal(true);
  protected checksOutdated: WritableSignal<boolean> = signal(false);
  protected displayedColumns: string[] = ['title', 'modifier', 'dc', 'outcome'];
  protected store: Store<CampingCalculationModuleState> = inject(Store);
  protected checkResults: WritableSignal<Map<string, CheckResult>> = signal(new Map());
  protected checksInfo: WritableSignal<Map<string, CampingDataCheck>> = signal(new Map());
  protected campingCalculationState: Signal<CampingCalculationState> = toSignal(
    this.store.select(campingCalculationFeature.name).pipe(takeUntil(this.destroy$)),
    {
      initialValue: {
        checks: [],
        commonDc: 20,
      },
    },
  );

  private readonly skillCheckPerformerService: CheckPerformerService = inject(CheckPerformerService);
  private readonly httpClient: HttpClient = inject(HttpClient);

  constructor() {
    this.httpClient
      .get<CampingData>('/assets/data/camping-checks.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.store.dispatch(CampingCalculationActions.fromSeed({ data }));
        this.checksInfo.set(new Map(data.checks.map((checkInfo) => [checkInfo.id, checkInfo])));
        this.loading.set(false);
      });

    this.dcFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.store.dispatch(CampingCalculationActions.updateCommonDc({ value: value ?? 0 }));
      this.checksOutdated.set(true);
    });
    effect(() => {
      const value1 = this.campingCalculationState().commonDc;
      this.dcFormControl.setValue(value1, { emitEvent: false });
    });
  }

  protected doAllChecks(): void {
    const checkResultsMap = new Map<string, CheckResult>();
    for (const check of this.campingCalculationState().checks) {
      checkResultsMap.set(
        check.id,
        this.skillCheckPerformerService.checkSkill(
          check.modifier,
          check.dc ?? this.campingCalculationState().commonDc,
        ),
      );
    }
    this.checkResults.set(checkResultsMap);
    this.checksOutdated.set(false);
  }

  protected getResultTooltip(id: string): string {
    const newVar = this.checkResults().get(id);
    return (newVar != null ? this.checksInfo().get(id)?.outcomes[newVar.checkResult] : null) ?? '';
  }

  protected onModifierChange(check: CheckDescriptionOptionalDc, event: Event): void {
    const modifier = parseInt((event.target as HTMLInputElement).value) ?? 0;
    this.store.dispatch(
      CampingCalculationActions.updateCheck({
        value: {
          ...check,
          modifier,
        },
      }),
    );
  }

  protected onDcChange(check: CheckDescriptionOptionalDc, event: Event): void {
    const dc = parseInt((event.target as HTMLInputElement).value) ?? 0;
    this.store.dispatch(
      CampingCalculationActions.updateCheck({
        value: {
          ...check,
          dc,
        },
      }),
    );
  }
}
