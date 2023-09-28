import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import {
  TravelMapDisplaySettingsActions,
  travelMapDisplaySettingsFeature,
  type TravelMapDisplaySettingsState,
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
  protected readonly store: Store<TravelMapModuleState> = inject(Store);
  protected readonly travelMapDisplaySettingsStateForm = new FormGroup({
    isMeshElementTitleDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
    isFogDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
  });

  protected readonly travelMapDisplaySettings: Signal<TravelMapDisplaySettingsState> = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.name),
    {
      requireSync: true,
    },
  );

  protected readonly isHideDisplayControls: WritableSignal<boolean> = signal(false);
  public constructor() {
    effect(() => {
      const settings = this.travelMapDisplaySettings();
      untracked(() => {
        this.travelMapDisplaySettingsStateForm.setValue({
          isFogDisplayed: settings.isFogDisplayed,
          isMeshElementTitleDisplayed: settings.isMeshElementTitleDisplayed,
        });
      });
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
