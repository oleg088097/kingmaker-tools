import { inject, Injectable, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapAreasFeature } from '../../+state/travel-map-area.state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { DEFAULT_AREA_FILL_COLOR } from '../../constants/default-color';
import { type MapAreaState } from '../../interfaces/map-area-state';
import { type MeshTileRender } from '../mesh-adapters/mesh-adapter-strategy';
import { MeshRendererService } from './mesh-renderer.service';
import { type Renderer } from './renderer';

@Injectable()
export class AreaEditRendererService implements Renderer {
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly plusMinusLineWidth = 15;
  private readonly meshState: Signal<TravelMapMeshState> = toSignal(
    this.store.select(travelMapMeshFeature.name),
    {
      requireSync: true,
    },
  );

  private readonly editAreaState: Signal<Partial<MapAreaState> | null> = toSignal(
    this.store.select(travelMapAreasFeature.selectEditArea),
    {
      requireSync: true,
    },
  );

  private editAreaRender: {
    path: Path2D;
    meshTileRenders: MeshTileRender[];
  } | null = null;

  public render(ctx: CanvasRenderingContext2D): void {
    const editAreaState = this.editAreaState();
    const meshState = this.meshState();

    if (editAreaState == null) {
      this.editAreaRender = null;
      return;
    }

    const areaMeshTiles: MeshTileRender[] = [];
    for (const meshElement of Object.values(meshState.meshMap)) {
      const meshRender = this.meshService.getMeshTileRender(meshElement.id) as MeshTileRender;
      if (editAreaState.meshElementIds?.includes(meshElement.id) === true) {
        areaMeshTiles.push(meshRender);
      } else {
        this.redrawAvailableForSelectionTile(meshRender, ctx);
      }
    }

    if (areaMeshTiles.length > 0) {
      this.editAreaRender = {
        path: areaMeshTiles.reduce((acc, elem) => {
          acc.addPath(elem.path);
          return acc;
        }, new Path2D()),
        meshTileRenders: areaMeshTiles,
      };
      this.redrawEditArea(editAreaState, ctx);
    }
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const editAreaState = this.editAreaState();
    if (
      editAreaState?.id != null &&
      this.editAreaRender != null &&
      ctx.isPointInPath(this.editAreaRender.path, x, y)
    ) {
      return [editAreaState.id];
    }
    return [];
  }

  private redrawEditArea(area: Partial<MapAreaState> | null, ctx: CanvasRenderingContext2D): void {
    if (this.editAreaRender != null) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = area?.color ?? DEFAULT_AREA_FILL_COLOR;
      ctx.fill(this.editAreaRender.path);

      ctx.lineWidth = 3;
      ctx.globalAlpha = 1;
      ctx.stroke(this.editAreaRender.path);

      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = this.plusMinusLineWidth;
      ctx.beginPath();
      for (const render of this.editAreaRender.meshTileRenders) {
        ctx.moveTo(render.center.x - this.plusMinusLineWidth * 2, render.center.y);
        ctx.lineTo(render.center.x + this.plusMinusLineWidth * 2, render.center.y);
      }
      ctx.stroke();

      ctx.restore();
    }
  }

  private redrawAvailableForSelectionTile(render: MeshTileRender, ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = this.plusMinusLineWidth;
    ctx.beginPath();
    ctx.moveTo(render.center.x - this.plusMinusLineWidth * 2, render.center.y);
    ctx.lineTo(render.center.x + this.plusMinusLineWidth * 2, render.center.y);
    ctx.moveTo(render.center.x, render.center.y - this.plusMinusLineWidth * 2);
    ctx.lineTo(render.center.x, render.center.y + this.plusMinusLineWidth * 2);
    ctx.stroke();
    ctx.restore();
  }
}
