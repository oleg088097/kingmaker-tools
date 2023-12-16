import { inject, Injectable, type Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapAreasFeature } from '../../+state/travel-map-areas.state';
import { type MapAreaState } from '../../interfaces/map-area-state';
import { type MeshTileRender } from '../mesh-adapters/mesh-adapter-strategy';
import { MeshRendererService } from './mesh-renderer.service';
import { type Renderer } from './renderer';

@Injectable()
export class AreaRendererService implements Renderer {
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly areasState: Signal<Record<string, MapAreaState>> = this.store.selectSignal(
    travelMapAreasFeature.selectAreas,
  );

  private readonly areaRenderMap = new Map<string, Path2D>();

  public render(ctx: CanvasRenderingContext2D): void {
    const areasState = this.areasState();
    for (const area of Object.values(areasState)) {
      if (area.inEdit === true) {
        continue;
      }
      const areaPath: Path2D = (area.meshElementIds ?? [])
        .map((id) => this.meshService.getMeshTileRender(id) as MeshTileRender)
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
