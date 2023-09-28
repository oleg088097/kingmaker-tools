import { ChangeDetectionStrategy, Component, ViewChild, inject, type ElementRef } from '@angular/core';
import { OVERLAY_TYPE } from '../../constants/overlay-type';
import { CanvasManagerProviderService } from '../../services/canvas-manager-provider.service';
import { MeshRendererService } from '../../services/renderers/mesh-renderer.service';

@Component({
  selector: 'app-map-mesh-overlay',
  templateUrl: './map-mesh-overlay.component.html',
  styleUrls: ['./map-mesh-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapMeshOverlayComponent {
  @ViewChild('canvasElement', { static: true }) set canvasElement(
    canvasElement: ElementRef<HTMLCanvasElement>,
  ) {
    this.canvasManager.setCanvasContext(canvasElement.nativeElement.getContext('2d'));
  }

  protected readonly overlayType = OVERLAY_TYPE.MESH;
  protected readonly meshService: MeshRendererService = inject(MeshRendererService);
  protected readonly canvasManager = inject(CanvasManagerProviderService).provideCanvasManager(
    this.meshService,
  );
}
