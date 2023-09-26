import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { TravelMapModuleState } from '../+state/+module-state';
import {
  TravelMapDisplaySettingsActions,
  travelMapDisplaySettingsFeature,
  TravelMapDisplaySettingsState,
} from '../+state/travel-map-display-settings.state';
import { DestroyService } from '../../utils/destroy.service';

@Component({
  selector: 'app-map-controls-overlay',
  templateUrl: './map-controls-overlay.component.html',
  styleUrls: ['./map-controls-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapControlsOverlayComponent implements OnInit {
  private static readonly SCALE_STEP = 0.25;
  private static readonly MIN_SCALE = 0.25;
  private static readonly MAX_SCALE = 2;

  private readonly destroy$ = inject(DestroyService);
  protected store: Store<TravelMapModuleState> = inject(Store);
  protected travelMapDisplaySettingsStateForm = new FormGroup({
    isMeshElementTitleDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
    isFogDisplayed: new FormControl<boolean>(true, { nonNullable: true }),
    scale: new FormControl<number>(1, { nonNullable: true }),
  });

  protected isHideDisplayControls: WritableSignal<boolean> = signal(false);
  protected scale: Signal<number> = toSignal(this.store.select(travelMapDisplaySettingsFeature.selectScale), {
    requireSync: true,
  });

  public constructor() {
    this.store
      .select(travelMapDisplaySettingsFeature.name)
      .pipe(takeUntil(this.destroy$))
      .subscribe((settings) => {
        this.travelMapDisplaySettingsStateForm.setValue({
          isFogDisplayed: settings.isFogDisplayed,
          isMeshElementTitleDisplayed: settings.isMeshElementTitleDisplayed,
          scale: settings.scale,
        });
      });
  }

  public ngOnInit(): void {
    this.travelMapDisplaySettingsStateForm.valueChanges
      .pipe(
        distinctUntilChanged((lhs, rhs) => isEqual(lhs, rhs)),
        takeUntil(this.destroy$),
      )
      .subscribe((displaySettings) =>
        this.store.dispatch(
          TravelMapDisplaySettingsActions.updateDisplaySettings({
            displaySettings: displaySettings as TravelMapDisplaySettingsState,
          }),
        ),
      );
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
    return this.scaleControl.value == MapControlsOverlayComponent.MIN_SCALE;
  }

  protected onScalePlus(): void {
    this.travelMapDisplaySettingsStateForm.controls.scale.setValue(
      this.scaleControl.value + MapControlsOverlayComponent.SCALE_STEP,
    );
  }

  protected isScalePlusDisabled(): boolean {
    return this.scaleControl.value == MapControlsOverlayComponent.MAX_SCALE;
  }
}
