import { computed, inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { TravelMapModuleState } from '../+state/+module-state';
import { travelMapAreasFeature, TravelMapAreasState } from '../+state/travel-map-area.state';
import {
  travelMapDisplaySettingsFeature,
  TravelMapDisplaySettingsState,
} from '../+state/travel-map-display-settings.state';
import { travelMapMeshFeature, TravelMapMeshState } from '../+state/travel-map-mesh.state';
import { MESH_TYPE } from '../interfaces/travel-map-data';
import { HexMeshAdapterStrategy } from './mesh-adapters/hex-mesh-adapter-strategy';
import { MeshAdapterStrategy } from './mesh-adapters/mesh-adapter-strategy';

@Injectable()
export class AreaService {
  private store: Store<TravelMapModuleState> = inject(Store);
  private displaySettings: Signal<TravelMapDisplaySettingsState> = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.name),
    { requireSync: true },
  );
  private meshState: Signal<TravelMapMeshState> = toSignal(this.store.select(travelMapMeshFeature.name), {
    requireSync: true,
  });
  private areasState: Signal<TravelMapAreasState> = toSignal(this.store.select(travelMapAreasFeature.name), {
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
  private areaRenderMap: Map<string, Path2D> = new Map();

  public drawAreas(ctx: CanvasRenderingContext2D): void {
    const meshState = this.meshState();
    const areasState = this.areasState();
    for (const area of Object.values(areasState.areas)) {
      const areaMeshElements: Path2D = area.meshElementIds
        .map((id) => this.impl().getMeshRender(id, meshState))
        .reduce((acc, elem) => {
          acc.addPath(elem.path);
          return acc;
        }, new Path2D());
      this.areaRenderMap.set(area.id, areaMeshElements);
      this.redrawArea(area.id, ctx);
    }
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const eventElementIds: string[] = [];
    for (const [key, path] of this.areaRenderMap.entries()) {
      if (ctx.isPointInPath(path, x, y)) {
        eventElementIds.push(key);
      }
    }
    return eventElementIds;
  }

  private redrawArea(meshId: string, ctx: CanvasRenderingContext2D) {
    const path = this.areaRenderMap.get(meshId);
    if (path) {
      ctx.save();
      const area = this.areasState().areas[meshId];
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = area.color;
      ctx.fill(path);
      ctx.restore();
    }
  }
}
