import { Directive, inject } from '@angular/core';
import { ObjectEditorPluginService } from '../../services/editors/object-editor-plugin.service';
import { MapSimpleOverlayComponent } from '../map-simple-overlay/map-simple-overlay.component';

// TODO add initial object position highlight for editing object

@Directive({
  selector: 'app-map-simple-overlay[appMapObjectEditingOverlay]',
})
export class MapObjectEditingOverlayDirective {
  private readonly objectEditorPluginService = inject(ObjectEditorPluginService);

  constructor(private readonly host: MapSimpleOverlayComponent) {
    host.canvasManager.addPlugin(this.objectEditorPluginService);
  }
}
/*
* import { ChangeDetectionStrategy, Component, ViewChild, inject, type ElementRef } from '@angular/core';
import { OVERLAY_TYPE } from '../../constants/overlay-type';
import {
  CanvasManagerProviderService,
  type CanvasManager,
} from '../../services/canvas-manager-provider.service';
import { RendererProviderService } from '../../services/renderer-provider.service';

@Component({
  selector: 'app-map-object-editing-overlay',
  templateUrl: './map-object-editing-overlay.component.html',
  styleUrls: ['./map-object-editing-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapObjectEditingOverlayComponent {
  @ViewChild('canvasElement', { static: true }) public set canvasElement(
    canvasElement: ElementRef<HTMLCanvasElement>,
  ) {
    this._canvasManager.setCanvas(canvasElement.nativeElement);
  }

  protected _overlayType: OVERLAY_TYPE = OVERLAY_TYPE.OBJECT_EDIT;
  private readonly rendererProviderService: RendererProviderService = inject(RendererProviderService);
  private readonly _canvasManager: CanvasManager = inject(CanvasManagerProviderService)
    .provideCanvasManager()
    .setRenderer(this.rendererProviderService.getRendererByOverlayType(this._overlayType));

  public get canvasManager(): CanvasManager {
    return this._canvasManager;
  }
}
*/
