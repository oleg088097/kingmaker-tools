import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapAreasFeature } from '../../+state/travel-map-area.state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { DestroyService } from '../../../utils/destroy.service';
import { type MapAreaState } from '../../interfaces/map-area-state';

@Component({
  selector: 'app-edit-control',
  templateUrl: './edit-control.component.html',
  styleUrls: ['./edit-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class EditControlComponent {
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly destroy$ = inject(DestroyService);
  protected readonly isHideDisplayControls: WritableSignal<boolean> = signal(false);
  /*
  protected readonly isTouchUI: Signal<boolean> = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 767px)')
      .pipe(map((breakpoint) => breakpoint.matches)),
    { requireSync: true },
  );
  */

  protected readonly editAreaState: Signal<Partial<MapAreaState> | null> = toSignal(
    this.store.select(travelMapAreasFeature.selectEditArea),
    {
      requireSync: true,
    },
  );

  protected readonly editObjectState: Signal<Partial<MapAreaState> | null> = toSignal(
    this.store.select(travelMapObjectsFeature.selectEditObject),
    {
      requireSync: true,
    },
  );
}
