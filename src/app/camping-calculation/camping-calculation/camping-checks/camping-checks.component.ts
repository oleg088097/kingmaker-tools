import {
  ChangeDetectionStrategy,
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { CampingCalculationModuleState } from '../../+state/+module-state';
import {
  CampingChecksActions,
  campingChecksFeature,
  CampingChecksState,
} from '../../+state/camping-checks.state';
import { CheckPerformerService, CheckResult } from '../../../shared/services';
import { CheckDependenciesAggregatorService } from '../../../shared/services/check-dependencies-aggregator.service';
import { DestroyService } from '../../../utils/destroy.service';
import {
  CampingCalculationData,
  CampingCalculationDataCampingCheck,
  CheckDescriptionCamping,
} from '../../interfaces/camping-calculation-data';

export interface CampingResultsChange {
  results: Map<string, CheckResult>;
  outdated: boolean;
}

@Component({
  selector: 'app-camping-checks',
  templateUrl: './camping-checks.component.html',
  styleUrls: ['./camping-checks.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampingChecksComponent {
  @Input() set campingCalculationData(data: CampingCalculationData | null) {
    switch (data?.version) {
      case 1:
      case 2: {
        this.checksInfo.set(new Map(data.checks.map((checkInfo) => [checkInfo.id, checkInfo])));
        break;
      }
      case 3: {
        this.checksInfo.set(new Map(data.campingChecks.checks.map((checkInfo) => [checkInfo.id, checkInfo])));
      }
    }
  }
  @Output() resultsChange: EventEmitter<CampingResultsChange> = new EventEmitter<CampingResultsChange>();

  protected destroy$ = inject(DestroyService);
  protected dcFormControl = new FormControl<number>(0, {
    nonNullable: true,
    validators: Validators.required,
  });
  protected checksOutdated: WritableSignal<boolean> = signal(false);
  protected displayedColumns: string[] = ['title', 'modifier', 'dc', 'outcome'];
  protected store: Store<CampingCalculationModuleState> = inject(Store);
  protected checkResults: WritableSignal<Map<string, CheckResult>> = signal(new Map());
  protected checksInfo: WritableSignal<Map<string, CampingCalculationDataCampingCheck>> = signal(new Map());
  protected campingChecksState: Signal<CampingChecksState> = toSignal(
    this.store.select(campingChecksFeature.name).pipe(takeUntil(this.destroy$)),
    {
      initialValue: {
        checks: [],
        commonDc: 20,
      },
    },
  );
  private skillCheckPerformerService: CheckPerformerService = inject(CheckPerformerService);
  private checkDependenciesAggregatorService: CheckDependenciesAggregatorService = inject(
    CheckDependenciesAggregatorService,
  );

  constructor() {
    this.dcFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.store.dispatch(CampingChecksActions.updateCommonDc({ value: value ?? 0 }));
      this.checksOutdated.set(true);
    });
    effect(() => {
      const commonDc = this.campingChecksState().commonDc;
      this.dcFormControl.setValue(commonDc, { emitEvent: false });
    });
    effect(() => {
      this.resultsChange.emit({
        results: this.checkResults(),
        outdated: this.checksOutdated(),
      });
    });
  }

  protected doAllChecks(): void {
    const checkResultsMap: Map<string, CheckResult> = new Map();
    for (const check of this.campingChecksState().checks) {
      const dependenciesOptions = this.checkDependenciesAggregatorService.aggregateDependenciesOptions(
        check.dependencies,
        checkResultsMap,
      );
      if (dependenciesOptions.skipCheck) {
        continue;
      }
      checkResultsMap.set(
        check.id,
        this.skillCheckPerformerService.doCheck(
          check.modifier + dependenciesOptions.modifier,
          check.dc ?? this.campingChecksState().commonDc,
          dependenciesOptions,
        ),
      );
    }
    this.checkResults.set(checkResultsMap);
    this.checksOutdated.set(false);
  }

  protected getResultTooltip(id: string): string {
    const checkResult = this.checkResults().get(id);
    return (checkResult ? this.checksInfo().get(id)?.outcomes[checkResult.checkResult] : null) ?? '';
  }

  protected onModifierChange(check: CheckDescriptionCamping, event: Event): void {
    const modifier = parseInt((event.target as HTMLInputElement).value) ?? 0;
    this.store.dispatch(
      CampingChecksActions.updateCheck({
        value: {
          ...check,
          modifier,
        },
      }),
    );
  }

  protected onDcChange(check: CheckDescriptionCamping, event: Event): void {
    const dc = parseInt((event.target as HTMLInputElement).value) ?? 0;
    this.store.dispatch(
      CampingChecksActions.updateCheck({
        value: {
          ...check,
          dc,
        },
      }),
    );
  }
}