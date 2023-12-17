import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { DestroyService } from 'shared_destroy-service';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapAreasFeature } from '../../+state/travel-map-areas.state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type MapAreaEditState } from '../../interfaces/map-area-state';
import { type MapObjectEditState } from '../../interfaces/map-object-state';

@Component({
  selector: 'app-edit-control',
  templateUrl: './edit-control.component.html',
  styleUrls: ['./edit-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class EditControlComponent {
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  protected readonly isHideDisplayControls: WritableSignal<boolean> = signal(false);

  protected readonly editAreaState: Signal<MapAreaEditState | null> = this.store.selectSignal(
    travelMapAreasFeature.selectEditArea,
  );

  protected readonly editObjectState: Signal<MapObjectEditState | null> = this.store.selectSignal(
    travelMapObjectsFeature.selectEditObject,
  );
}
