import { Directive, inject } from '@angular/core';
import { AreaEditorPluginService } from '../../services/editors/area-editor-plugin.service';
import { MapSimpleOverlayComponent } from '../map-simple-overlay/map-simple-overlay.component';

// TODO add initial borders highlight for editing area

@Directive({
  selector: 'app-map-simple-overlay[appMapAreaEditingOverlay]',
})
export class MapAreaEditingOverlayDirective {
  private readonly areaEditorService = inject(AreaEditorPluginService);

  constructor(private readonly host: MapSimpleOverlayComponent) {
    host.canvasManager.addPlugin(this.areaEditorService);
  }
}
