import { ChangeDetectionStrategy, Component, ViewChild, inject, type ElementRef } from '@angular/core';
import { OVERLAY_TYPE } from '../../constants/overlay-type';
import { CanvasManagerProviderService } from '../../services/canvas-manager-provider.service';
import { AreaRendererService } from '../../services/renderers/area-renderer.service';

@Component({
  selector: 'app-map-area-overlay',
  templateUrl: './map-area-overlay.component.html',
  styleUrls: ['./map-area-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapAreaOverlayComponent {
  @ViewChild('canvasElement', { static: true }) set canvasElement(
    canvasElement: ElementRef<HTMLCanvasElement>,
  ) {
    this.canvasManager.setCanvasContext(canvasElement.nativeElement.getContext('2d'));
  }

  protected readonly overlayType = OVERLAY_TYPE.AREA;
  protected readonly areaService: AreaRendererService = inject(AreaRendererService);
  protected readonly canvasManager = inject(CanvasManagerProviderService).provideCanvasManager(
    this.areaService,
  );
}
