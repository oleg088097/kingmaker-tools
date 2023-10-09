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
  RandomEncounterCheckActions,
  randomEncounterCheckFeature,
  RandomEncounterCheckState,
} from '../../+state/random-encounter-check.state';
import { CheckPerformerService, CheckResult } from '../../../shared/services';
import { CheckDependenciesAggregatorService } from '../../../shared/services/check-dependencies-aggregator.service';
import { DestroyService } from '../../../utils/destroy.service';
import { CampingResultsChange } from '../camping-checks/camping-checks.component';

export interface RandomEncounterResultChange {
  result: CheckResult | null;
  outdated: boolean;
}

@Component({
  selector: 'app-random-encounter-check',
  templateUrl: './random-encounter-check.component.html',
  styleUrls: ['./random-encounter-check.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RandomEncounterCheckComponent {
  @Input() set campingResults(campingResults: CampingResultsChange | null) {
    this.checkOutdated.set(true);
    this._campingResults = campingResults;
  }
  @Output() resultsChange: EventEmitter<RandomEncounterResultChange> =
    new EventEmitter<RandomEncounterResultChange>();

  protected destroy$ = inject(DestroyService);
  protected dcFormControl = new FormControl<number>(0, {
    nonNullable: true,
    validators: Validators.required,
  });
  protected checkResult: WritableSignal<CheckResult | undefined> = signal(undefined);
  protected checkOutdated: WritableSignal<boolean> = signal(false);
  protected store: Store<CampingCalculationModuleState> = inject(Store);
  protected randomEncounterCheckState: Signal<RandomEncounterCheckState> = toSignal(
    this.store.select(randomEncounterCheckFeature.name).pipe(takeUntil(this.destroy$)),
    {
      initialValue: {
        flatDc: 15,
        campingChecksDependencies: {},
      },
    },
  );
  private skillCheckPerformerService: CheckPerformerService = inject(CheckPerformerService);
  private checkDependenciesAggregatorService: CheckDependenciesAggregatorService = inject(
    CheckDependenciesAggregatorService,
  );
  private _campingResults: CampingResultsChange | null = null;

  constructor() {
    this.dcFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.store.dispatch(RandomEncounterCheckActions.updateFlatDc({ value: value ?? 0 }));
      this.checkOutdated.set(true);
    });
    effect(() => {
      const flatDc = this.randomEncounterCheckState().flatDc;
      this.dcFormControl.setValue(flatDc, { emitEvent: false });
    });
    effect(() => {
      this.resultsChange.emit({
        result: this.checkResult() ?? null,
        outdated: this.checkOutdated(),
      });
    });
  }

  protected doFlatCheck(): void {
    const dependenciesOptions = this.checkDependenciesAggregatorService.aggregateDependenciesOptions(
      this.randomEncounterCheckState().campingChecksDependencies,
      this._campingResults?.results,
    );
    if (dependenciesOptions.skipCheck) {
      return;
    }

    const result = this.skillCheckPerformerService.doCheck(
      0,
      this.randomEncounterCheckState().flatDc + dependenciesOptions.modifier,
      dependenciesOptions,
    );
    this.checkResult.set(result);
    this.checkOutdated.set(false);
  }
}