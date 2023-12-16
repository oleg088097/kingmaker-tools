import { Directive, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapAreasFeature } from '../../+state/travel-map-areas.state';
import { DestroyService } from '../../../utils/destroy.service';
import { AreaEditorPluginService } from '../../services/editors/area-editor-plugin.service';
import { MapSimpleOverlayComponent } from '../map-simple-overlay/map-simple-overlay.component';

// TODO add initial borders highlight for editing area

@Directive({
  selector: 'app-map-simple-overlay[appMapAreaEditingOverlay]',
  providers: [DestroyService],
})
export class MapAreaEditingOverlayDirective {
  private readonly areaEditorService = inject(AreaEditorPluginService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly destroy$ = inject(DestroyService);

  constructor(readonly host: MapSimpleOverlayComponent) {
    this.store
      .select(travelMapAreasFeature.selectEditArea)
      .pipe(takeUntil(this.destroy$))
      .subscribe((editAreaState) => {
        host.setIsPointerEventsTarget(Boolean(editAreaState));
      });
    host.canvasManager.addPlugin(this.areaEditorService);
  }
}
