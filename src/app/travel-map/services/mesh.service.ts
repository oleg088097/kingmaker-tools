import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { TravelMapModuleState } from '../+state/+module-state';
import {
  travelMapDisplaySettingsFeature,
  TravelMapDisplaySettingsState,
} from '../+state/travel-map-display-settings.state';
import { travelMapMeshFeature, TravelMapMeshState } from '../+state/travel-map-mesh.state';
import { MESH_TYPE } from '../interfaces/travel-map-data';
import { HexMeshAdapterStrategy } from './mesh-adapters/hex-mesh-adapter-strategy';
import { MeshAdapterStrategy, MeshRender } from './mesh-adapters/mesh-adapter-strategy';

@Injectable()
export class MeshService {
  private store: Store<TravelMapModuleState> = inject(Store);
  private displaySettings: Signal<TravelMapDisplaySettingsState> = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.name),
    { requireSync: true },
  );
  private meshState: Signal<TravelMapMeshState> = toSignal(this.store.select(travelMapMeshFeature.name), {
    requireSync: true,
  });
  private impl: Signal<MeshAdapterStrategy> = computed(() => {
    switch (this.meshState().meshProperties.type) {
      case MESH_TYPE.HEX:
        return new HexMeshAdapterStrategy();
        break;
      case MESH_TYPE.SQUARE:
        throw 'not supported';
        break;
    }
  });
  private meshRenderMap: Map<string, MeshRender> = new Map();

  public drawMesh(ctx: CanvasRenderingContext2D): void {
    const meshState = this.meshState();
    for (const meshElement of Object.values(meshState.meshMap)) {
      const meshRender = this.impl().getMeshRender(meshElement.id, meshState);
      this.meshRenderMap.set(meshElement.id, meshRender);
      this.redrawMeshElement(meshElement.id, ctx);
    }
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const eventElementIds: string[] = [];
    for (const [key, meshRender] of this.meshRenderMap.entries()) {
      if (ctx.isPointInPath(meshRender.path, x, y)) {
        eventElementIds.push(key);
      }
    }
    return eventElementIds;
  }

  private redrawMeshElement(meshId: string, ctx: CanvasRenderingContext2D) {
    const meshRender = this.meshRenderMap.get(meshId);
    if (meshRender) {
      ctx.save();
      const meshMapElement = this.meshState().meshMap[meshId];
      ctx.fillStyle =
        this.displaySettings().isFogDisplayed && (meshMapElement?.fog ?? true) ? 'grey' : 'transparent';
      ctx.fill(meshRender.path);
      if (this.displaySettings().isMeshElementTitleDisplayed) {
        ctx.fillStyle = 'black';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          meshMapElement.title,
          meshRender.center.x,
          meshRender.center.y + this.meshState().meshProperties.size * 0.5,
        );
      }
      ctx.restore();
    }
  }
}
