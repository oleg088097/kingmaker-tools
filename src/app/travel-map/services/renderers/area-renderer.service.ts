import { computed, inject, Injectable, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapAreasFeature } from '../../+state/travel-map-area.state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { type MapAreaState } from '../../interfaces/map-area-state';
import { MESH_TYPE } from '../../interfaces/travel-map-data';
import { HexMeshAdapterStrategy } from '../mesh-adapters/hex-mesh-adapter-strategy';
import { type MeshAdapterStrategy } from '../mesh-adapters/mesh-adapter-strategy';
import { type Renderer } from './renderer';

@Injectable()
export class AreaRendererService implements Renderer {
  private readonly store: Store<TravelMapModuleState> = inject(Store);
  private readonly meshState: Signal<TravelMapMeshState> = toSignal(
    this.store.select(travelMapMeshFeature.name),
    {
      requireSync: true,
    },
  );

  private readonly areasState: Signal<Record<string, MapAreaState>> = toSignal(
    this.store.select(travelMapAreasFeature.selectAreas),
    {
      requireSync: true,
    },
  );

  private readonly impl: Signal<MeshAdapterStrategy> = computed(() => {
    switch (this.meshState().meshProperties.type) {
      case MESH_TYPE.HEX:
        return new HexMeshAdapterStrategy();
        break;
      case MESH_TYPE.SQUARE:
        throw new Error('not supported');
        break;
      default:
        throw new Error('not supported');
        break;
    }
  });

  private readonly areaRenderMap = new Map<string, Path2D>();

  public render(ctx: CanvasRenderingContext2D): void {
    const meshState = this.meshState();
    const areasState = this.areasState();
    for (const area of Object.values(areasState)) {
      if (area.hidden || area.inEdit === true) {
        continue;
      }
      const areaPath: Path2D = (area.meshElementIds ?? [])
        .map((id) => this.impl().getMeshTileRender(id, meshState))
        .reduce((acc, elem) => {
          acc.addPath(elem.path);
          return acc;
        }, new Path2D());
      this.areaRenderMap.set(area.id, areaPath);
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

  private redrawArea(areaId: string, ctx: CanvasRenderingContext2D): void {
    const path = this.areaRenderMap.get(areaId);
    if (path != null) {
      ctx.save();
      const area = this.areasState()[areaId];
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = area.color;
      ctx.fill(path);
      ctx.restore();
    }
  }
}
