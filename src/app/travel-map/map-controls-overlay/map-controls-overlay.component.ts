import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { type TravelMapModuleState } from '../+state/+module-state';
import {
  TravelMapDisplaySettingsActions,
  travelMapDisplaySettingsFeature,
  type TravelMapDisplaySettingsState,
} from '../+state/travel-map-display-settings.state';
import { DestroyService } from '../../utils/destroy.service';

@Component({
  selector: 'app-map-controls-overlay',
  templateUrl: './map-controls-overlay.component.html',
  styleUrls: ['./map-controls-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class MapControlsOverlayComponent {
  private static readonly SCALE_STEP = 0.25;
  private static readonly MIN_SCALE = 0.25;
  private static readonly MAX_SCALE = 2;

  private readonly destroy$ = inject(DestroyService);
  protected readonly store: Store<TravelMapModuleState> = inject(Store);
  protected readonly travelMapDisplaySettingsStateForm = new FormGroup({
    isMeshElementTitleDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
    isFogDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
    scale: new FormControl<number>(1, { nonNullable: true }),
  });

  protected readonly travelMapDisplaySettings: Signal<TravelMapDisplaySettingsState> = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.name),
    {
      requireSync: true,
    },
  );

  protected readonly scale: Signal<number> = computed(() => this.travelMapDisplaySettings().scale);

  protected readonly isHideDisplayControls: WritableSignal<boolean> = signal(false);
  public constructor() {
    effect(() => {
      const settings = this.travelMapDisplaySettings();
      untracked(() => {
        this.travelMapDisplaySettingsStateForm.setValue({
          isFogDisplayed: settings.isFogDisplayed,
          isMeshElementTitleDisplayed: settings.isMeshElementTitleDisplayed,
          scale: settings.scale,
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
            displaySettings: displaySettings as TravelMapDisplaySettingsState,
          }),
        );
      });
  }

  protected get scaleControl(): FormControl<number> {
    return this.travelMapDisplaySettingsStateForm.controls.scale;
  }

  protected onScaleMinus(): void {
    this.travelMapDisplaySettingsStateForm.controls.scale.setValue(
      this.scaleControl.value - MapControlsOverlayComponent.SCALE_STEP,
    );
  }

  protected isScaleMinusDisabled(): boolean {
    return this.scaleControl.value === MapControlsOverlayComponent.MIN_SCALE;
  }

  protected onScalePlus(): void {
    this.travelMapDisplaySettingsStateForm.controls.scale.setValue(
      this.scaleControl.value + MapControlsOverlayComponent.SCALE_STEP,
    );
  }

  protected isScalePlusDisabled(): boolean {
    return this.scaleControl.value === MapControlsOverlayComponent.MAX_SCALE;
  }
}
