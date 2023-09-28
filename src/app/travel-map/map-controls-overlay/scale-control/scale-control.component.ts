import { ChangeDetectionStrategy, Component, effect, inject, untracked, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import {
  TravelMapDisplaySettingsActions,
  travelMapDisplaySettingsFeature,
} from '../../+state/travel-map-display-settings.state';
import { DestroyService } from '../../../utils/destroy.service';

@Component({
  selector: 'app-scale-control',
  templateUrl: './scale-control.component.html',
  styleUrls: ['./scale-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class ScaleControlComponent {
  private static readonly SCALE_STEP = 0.25;
  private static readonly MIN_SCALE = 0.25;
  private static readonly MAX_SCALE = 2;

  private readonly store: Store<TravelMapModuleState> = inject(Store);
  private readonly destroy$ = inject(DestroyService);
  protected readonly scaleControl = new FormControl<number>(1, { nonNullable: true });
  protected readonly scale: Signal<number> = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.selectScale),
    {
      requireSync: true,
    },
  );

  public constructor() {
    effect(() => {
      untracked(() => {
        this.scaleControl.setValue(this.scale());
      });
    });
    this.scaleControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((scale) => {
        this.store.dispatch(
          TravelMapDisplaySettingsActions.updateDisplaySettings({
            displaySettings: {
              scale,
            },
          }),
        );
      });
  }

  protected onScaleMinus(): void {
    this.scaleControl.setValue(this.scaleControl.value - ScaleControlComponent.SCALE_STEP);
  }

  protected isScaleMinusDisabled(): boolean {
    return this.scaleControl.value === ScaleControlComponent.MIN_SCALE;
  }

  protected onScalePlus(): void {
    this.scaleControl.setValue(this.scaleControl.value + ScaleControlComponent.SCALE_STEP);
  }

  protected isScalePlusDisabled(): boolean {
    return this.scaleControl.value === ScaleControlComponent.MAX_SCALE;
  }
}
