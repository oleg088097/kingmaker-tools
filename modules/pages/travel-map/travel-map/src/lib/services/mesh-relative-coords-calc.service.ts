import { inject, Injectable, type Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../+state/+module-state';
import { travelMapDisplaySettingsFeature } from '../+state/travel-map-display-settings.state';
import { MeshRendererService } from './renderers/mesh-renderer.service';

@Injectable()
export class MeshRelativeCoordsCalcService {
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  protected readonly scale: Signal<number> = this.store.selectSignal(
    travelMapDisplaySettingsFeature.selectScale,
  );

  public calculateRelativeCoordinates(
    x: number,
    y: number,
    meshElementId: string,
  ): { x: number; y: number } | null {
    const scale = this.scale();
    const tileRender = this.meshService.getMeshTileRender(meshElementId);
    if (tileRender === null) {
      return null;
    }
    return {
      x: x / scale - tileRender.center.x,
      y: y / scale - tileRender.center.y,
    };
  }
}
