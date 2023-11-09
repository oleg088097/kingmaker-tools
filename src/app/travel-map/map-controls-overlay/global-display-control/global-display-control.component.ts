import { ChangeDetectionStrategy, Component, inject, signal, type WritableSignal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import {
  TravelMapDisplaySettingsActions,
  travelMapDisplaySettingsFeature,
} from '../../+state/travel-map-display-settings.state';
import { DestroyService } from '../../../utils/destroy.service';

@Component({
  selector: 'app-global-display-control',
  templateUrl: './global-display-control.component.html',
  styleUrls: ['./global-display-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class GlobalDisplayControlComponent {
  private readonly destroy$ = inject(DestroyService);
  protected readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  protected readonly isHideDisplayControls: WritableSignal<boolean> = signal(false);
  protected readonly travelMapDisplaySettingsStateForm = new FormGroup({
    isMeshElementTitleDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
    isFogDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
  });

  public constructor() {
    this.store
      .select(travelMapDisplaySettingsFeature.name)
      .pipe(takeUntil(this.destroy$))
      .subscribe((settings) => {
        this.travelMapDisplaySettingsStateForm.setValue(
          {
            isFogDisplayed: settings.isFogDisplayed,
            isMeshElementTitleDisplayed: settings.isMeshElementTitleDisplayed,
          },
          { emitEvent: false },
        );
      });

    this.travelMapDisplaySettingsStateForm.valueChanges
      .pipe(
        distinctUntilChanged((lhs, rhs) => isEqual(lhs, rhs)),
        takeUntil(this.destroy$),
      )
      .subscribe((displaySettings) => {
        this.store.dispatch(
          TravelMapDisplaySettingsActions.updateDisplaySettings({
            displaySettings,
          }),
        );
      });
  }
}
