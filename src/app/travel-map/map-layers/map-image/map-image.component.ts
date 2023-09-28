import { ChangeDetectionStrategy, Component, HostBinding, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapImageFeature } from '../../+state/travel-map-image.state';

@Component({
  selector: 'app-map-image',
  templateUrl: './map-image.component.html',
  styleUrls: ['./map-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapImageComponent {
  protected store: Store<TravelMapModuleState> = inject(Store);
  protected travelMapImageState = toSignal(this.store.select(travelMapImageFeature.selectImage), {
    requireSync: true,
  });

  @HostBinding('style.background-image') protected get backgroundImage(): string {
    return `url(${this.travelMapImageState().url})`;
  }
}
