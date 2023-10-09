import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { CampingCalculationModuleState } from '../+state/+module-state';
import { CampingChecksActions } from '../+state/camping-checks.state';
import { RandomEncounterCheckActions } from '../+state/random-encounter-check.state';
import { WatchChecksActions } from '../+state/watch-checks.state';
import { DestroyService } from '../../utils/destroy.service';
import { CampingCalculationData } from '../interfaces/camping-calculation-data';
import { CampingResultsChange } from './camping-checks/camping-checks.component';
import { RandomEncounterResultChange } from './random-encounter-check/random-encounter-check.component';
import { WatchResultChange } from './watch-checks/watch-checks.component';

@Component({
  selector: 'app-camping-calculation',
  templateUrl: './camping-calculation.component.html',
  styleUrls: ['./camping-calculation.component.scss'],
  providers: [
    DestroyService,
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampingCalculationComponent {
  protected destroy$ = inject(DestroyService);
  protected campingCalculationData: WritableSignal<CampingCalculationData | null> = signal(null);
  protected store: Store<CampingCalculationModuleState> = inject(Store);
  private httpClient: HttpClient = inject(HttpClient);

  protected campingResultControl = new FormControl<CampingResultsChange | null>(null, {
    validators: [
      (control: AbstractControl<CampingResultsChange | null>) =>
        control?.value && control.value.results.size > 0 && !control.value.outdated
          ? null
          : { noCampingResult: true },
    ],
  });
  protected randomEncounterResultControl = new FormControl<RandomEncounterResultChange | null>(null, {
    validators: [
      (control: AbstractControl<RandomEncounterResultChange | null>) =>
        control?.value && control.value?.result && !control.value.outdated ? null : { noCampingResult: true },
    ],
  });
  protected watchResultControl = new FormControl<WatchResultChange | null>(null, {
    validators: [
      (control: AbstractControl<RandomEncounterResultChange | null>) =>
        control?.value && control.value?.result && !control.value.outdated ? null : { noCampingResult: true },
    ],
  });

  constructor() {
    this.httpClient
      .get<CampingCalculationData>('/assets/data/camping-calculation.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.store.dispatch(CampingChecksActions.fromData({ data }));
        this.store.dispatch(RandomEncounterCheckActions.fromData({ data }));
        this.store.dispatch(WatchChecksActions.fromData({ data }));
        this.campingCalculationData.set(data);
      });
  }

  protected onCampingResultChange(change: CampingResultsChange): void {
    this.campingResultControl.setValue(change);
  }

  protected onRandomEncounterResultChange(change: RandomEncounterResultChange): void {
    this.randomEncounterResultControl.setValue(change);
  }

  protected onWatchResultChange(change: WatchResultChange): void {
    this.watchResultControl.setValue(change);
  }
}
