import { computed, inject, Injectable, type Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../../+state/+module-state';
import {
  travelMapDisplaySettingsFeature,
  type TravelMapDisplaySettingsState,
} from '../../+state/travel-map-display-settings.state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { MESH_TYPE } from '../../interfaces/travel-map-data';
import { HexMeshAdapterStrategy } from '../mesh-adapters/hex-mesh-adapter-strategy';
import { type MeshAdapterStrategy, type MeshTileRender } from '../mesh-adapters/mesh-adapter-strategy';
import { type Renderer } from './renderer';

@Injectable()
export class MeshRendererService implements Renderer {
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly displaySettings: Signal<TravelMapDisplaySettingsState> = this.store.selectSignal(
    travelMapDisplaySettingsFeature.selectTravelMapDisplaySettingsState,
  );

  private readonly meshState: Signal<TravelMapMeshState> = this.store.selectSignal(
    travelMapMeshFeature.selectTravelMapMeshState,
  );

  private readonly impl: Signal<MeshAdapterStrategy> = computed(() => {
    switch (this.meshState().meshProperties.type) {
      case MESH_TYPE.HEX:
        return new HexMeshAdapterStrategy();
        break;
      case MESH_TYPE.SQUARE:
        throw new Error('not supported');
        break;
    }
  });

  private readonly meshRenderMap = new Map<string, MeshTileRender>();

  public render(ctx: CanvasRenderingContext2D): void {
    const meshState = this.meshState();
    for (const meshElement of Object.values(meshState.meshMap)) {
      const meshRender = this.getMeshTileRender(meshElement.id)!;
      this.redrawMeshElement(meshRender, meshElement.id, ctx);
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

  public getMeshTileRender(tileId: string): MeshTileRender | null {
    const meshState = this.meshState();
    const meshElement = meshState.meshMap[tileId];
    if (meshElement === undefined) {
      return null;
    }
    if (this.meshRenderMap.has(tileId)) {
      return this.meshRenderMap.get(tileId)!;
    }
    const meshRender = this.impl().getMeshTileRender(meshElement.id, meshState);
    this.meshRenderMap.set(meshElement.id, meshRender);
    return meshRender;
  }

  private redrawMeshElement(meshRender: MeshTileRender, meshId: string, ctx: CanvasRenderingContext2D): void {
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
