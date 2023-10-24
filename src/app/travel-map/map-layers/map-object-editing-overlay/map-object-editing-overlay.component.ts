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
