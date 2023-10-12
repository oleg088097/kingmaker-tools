import { ChangeDetectionStrategy, Component, Input, ViewChild, inject, type ElementRef } from '@angular/core';
import { type OVERLAY_TYPE } from '../../constants/overlay-type';
import {
  CanvasManagerProviderService,
  type CanvasManager,
} from '../../services/canvas-manager-provider.service';
import { RendererProviderService } from '../../services/renderer-provider.service';

@Component({
  selector: 'app-map-simple-overlay',
  templateUrl: './map-simple-overlay.component.html',
  styleUrls: ['./map-simple-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapSimpleOverlayComponent {
  @ViewChild('canvasElement', { static: true }) public set canvasElement(
    canvasElement: ElementRef<HTMLCanvasElement>,
  ) {
    this.canvasManager.setCanvasContext(canvasElement.nativeElement.getContext('2d'));
  }

  @Input({ required: true }) public set overlayType(overlayType: OVERLAY_TYPE) {
    // TODO no way to destroy canvas manager. Add?
    this._overlayType = overlayType;
    const renderer = this.rendererProviderService.getRendererByOverlayType(overlayType);
    this.canvasManager.setRenderer(renderer);
  }

  protected _overlayType!: OVERLAY_TYPE;
  private readonly rendererProviderService: RendererProviderService = inject(RendererProviderService);
  private readonly canvasManager: CanvasManager = inject(CanvasManagerProviderService).provideCanvasManager();
}
