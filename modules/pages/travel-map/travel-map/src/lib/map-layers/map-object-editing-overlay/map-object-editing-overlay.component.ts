import { Directive, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { DestroyService } from 'shared_destroy-service';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { ObjectEditorPluginService } from '../../services/editors/object-editor-plugin.service';
import { MapSimpleOverlayComponent } from '../map-simple-overlay/map-simple-overlay.component';

// TODO add initial object position highlight for editing object

@Directive({
  selector: 'app-map-simple-overlay[appMapObjectEditingOverlay]',
  providers: [DestroyService],
})
export class MapObjectEditingOverlayDirective {
  private readonly objectEditorPluginService = inject(ObjectEditorPluginService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly destroy$ = inject(DestroyService);

  constructor(private readonly host: MapSimpleOverlayComponent) {
    this.store
      .select(travelMapObjectsFeature.selectEditObject)
      .pipe(takeUntil(this.destroy$))
      .subscribe((editObjectState) => {
        host.setIsPointerEventsTarget(Boolean(editObjectState));
      });
    host.canvasManager.addPlugin(this.objectEditorPluginService);
  }
}
