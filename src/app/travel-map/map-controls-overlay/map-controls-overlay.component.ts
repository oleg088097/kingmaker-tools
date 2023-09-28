import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../+state/+module-state';
import { DestroyService } from '../../utils/destroy.service';

@Component({
  selector: 'app-map-controls-overlay',
  templateUrl: './map-controls-overlay.component.html',
  styleUrls: ['./map-controls-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class MapControlsOverlayComponent {
  private readonly destroy$ = inject(DestroyService);
  protected readonly store: Store<TravelMapModuleState> = inject(Store);
}
