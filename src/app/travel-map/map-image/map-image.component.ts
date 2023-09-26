import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-map-image',
  templateUrl: './map-image.component.html',
  styleUrls: ['./map-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapImageComponent {
  @HostBinding('style.background-image') protected get backgroundImage(): string {
    return 'url("/assets/img/map.png")';
  }
}
