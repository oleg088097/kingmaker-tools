import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { DestroyService } from 'shared_destroy-service';
import { type TravelMapModuleState } from '../+state/+module-state';

@Component({
  selector: 'app-map-controls-overlay',
  templateUrl: './map-controls-overlay.component.html',
  styleUrls: ['./map-controls-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class MapControlsOverlayComponent {
  private readonly destroy$ = inject(DestroyService);
  protected readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
}
