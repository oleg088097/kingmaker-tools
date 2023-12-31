import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { type CampingCalculationModuleState } from '../../+state/+module-state';
import {
  WatchChecksActions,
  watchChecksFeature,
  type WatchChecksState,
} from '../../+state/watch-checks.state';
import { CheckPerformerService, type CheckResult } from '../../../shared/services';
import { CheckDependenciesAggregatorService } from '../../../shared/services/check-dependencies-aggregator.service';
import { DestroyService } from '../../../utils/destroy.service';
import { TouchUiService } from '../../../utils/touch-ui.service';
import { type CampingCalculationDataWatchCheck } from '../../interfaces/camping-calculation-data';
import { type CampingResultsChange } from '../camping-checks/camping-checks.component';

export interface WatchCheckResult {
  id: string;
  stealthCheckResult: CheckResult;
  perceptionCheckResult: CheckResult;
}

export interface WatchResultChange {
  result: WatchCheckResult | null;
  outdated: boolean;
}

@Component({
  selector: 'app-watch-checks',
  templateUrl: './watch-checks.component.html',
  styleUrls: ['./watch-checks.component.scss'],
  providers: [DestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchChecksComponent {
  @Input() set campingResults(campingResults: CampingResultsChange | null) {
    this.checkOutdated.set(true);
    this._campingResults = campingResults;
  }

  @Output() resultsChange: EventEmitter<WatchResultChange> = new EventEmitter<WatchResultChange>();
  @ViewChild('resultTemplate', { read: TemplateRef }) resultTemplate!: TemplateRef<unknown>;
  protected destroy$ = inject(DestroyService);
  protected dcFormControl = new FormControl<number>(0, {
    nonNullable: true,
    validators: Validators.required,
  });

  protected checkOutdated: WritableSignal<boolean> = signal(false);
  protected editMode: WritableSignal<boolean> = signal(false);
  protected store: Store<CampingCalculationModuleState> = inject<Store<CampingCalculationModuleState>>(Store);
  private readonly isTouchUI: Signal<boolean> = inject(TouchUiService).isTouchUI;
  protected checkResult: WritableSignal<WatchCheckResult | null> = signal(null);
  protected watchChecksState: Signal<WatchChecksState> = this.store.selectSignal(
    watchChecksFeature.selectWatchChecksState,
  );

  protected enabledChecks: Signal<CampingCalculationDataWatchCheck[]> = computed(() =>
    this.watchChecksState().checks.filter((check) => !check.disabled),
  );

  private readonly skillCheckPerformerService: CheckPerformerService = inject(CheckPerformerService);
  private readonly checkDependenciesAggregatorService: CheckDependenciesAggregatorService = inject(
    CheckDependenciesAggregatorService,
  );

  private readonly matBottomSheet: MatBottomSheet = inject(MatBottomSheet);
  private _campingResults: CampingResultsChange | null = null;

  constructor() {
    this.dcFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.store.dispatch(WatchChecksActions.updateStealthModifier({ value: value ?? 0 }));
      this.checkOutdated.set(true);
    });
    this.store
      .select(watchChecksFeature.selectChecks)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.checkOutdated.set(true);
      });

    effect(() => {
      const commonDc = this.watchChecksState().stealthModifier;
      this.dcFormControl.setValue(commonDc, { emitEvent: false });
    });
    effect(() => {
      this.resultsChange.emit({
        result: this.checkResult(),
        outdated: this.checkOutdated(),
      });
    });
  }

  protected doAllChecks(): void {
    const watchChecksState = this.watchChecksState();
    const dependenciesOptions = this.checkDependenciesAggregatorService.aggregateDependenciesOptions(
      watchChecksState.campingChecksDependencies,
      this._campingResults?.results,
    );
    if (dependenciesOptions.skipCheck) {
      return;
    }

    const enabledChecks = this.enabledChecks();
    const index = Math.ceil(Math.random() * enabledChecks.length) - 1;
    const selectedCheck = enabledChecks[index];

    const perceptionCheckResult = this.skillCheckPerformerService.doCheck(
      selectedCheck.modifier + dependenciesOptions.modifier,
      10 + watchChecksState.stealthModifier,
      dependenciesOptions,
    );
    const stealthCheckResult = this.skillCheckPerformerService.doCheck(
      watchChecksState.stealthModifier,
      10 + selectedCheck.modifier + dependenciesOptions.modifier,
    );
    this.checkResult.set({
      id: selectedCheck.id,
      stealthCheckResult,
      perceptionCheckResult,
    });
    this.checkOutdated.set(false);

    if (this.isTouchUI()) {
      this.openResultBottomSheet();
    }
  }

  protected getCheckById(checkId: string): CampingCalculationDataWatchCheck {
    return this.watchChecksState().checks.find(
      ({ id }) => id === checkId,
    ) as CampingCalculationDataWatchCheck;
  }

  protected onModifierChange(check: CampingCalculationDataWatchCheck, event: Event): void {
    const modifier = parseInt((event.target as HTMLInputElement).value) ?? 0;
    this.store.dispatch(
      WatchChecksActions.updateCheck({
        value: {
          ...check,
          modifier,
        },
      }),
    );
  }

  protected onSelectionChange(check: CampingCalculationDataWatchCheck, checkedState: boolean): void {
    this.store.dispatch(
      WatchChecksActions.updateCheck({
        value: {
          ...check,
          disabled: !checkedState,
        },
      }),
    );
  }

  protected openResultBottomSheet(): void {
    this.matBottomSheet.open(this.resultTemplate);
  }
}
