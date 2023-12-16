import { inject, type Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../+state/+module-state';
import { travelMapDisplaySettingsFeature } from '../+state/travel-map-display-settings.state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../+state/travel-map-mesh.state';
import { type MapObjectEditState, type MapObjectState } from '../interfaces/map-object-state';
import { type MeshTileRender } from './mesh-adapters/mesh-adapter-strategy';
import { MeshRendererService } from './renderers/mesh-renderer.service';

export class ObjectCoordsCalculatorService {
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  protected readonly scale: Signal<number> = this.store.selectSignal(
    travelMapDisplaySettingsFeature.selectScale,
  );

  private readonly meshState: Signal<TravelMapMeshState> = this.store.selectSignal(
    travelMapMeshFeature.selectTravelMapMeshState,
  );

  public getIconSize(): number {
    const meshState = this.meshState();
    return meshState.meshProperties.size / 2;
  }

  public getObjectIconScale(iconPath: string): number {
    const rawIconDimensions = 512;
    const iconSize = this.getIconSize();
    return iconSize / rawIconDimensions;
  }

  public calculateObjectPosition(object: MapObjectEditState | MapObjectState): {
    center: { x: number; y: number };
    topLeft: { x: number; y: number };
  } {
    const halfIconSize = this.getIconSize() / 2;
    const meshTileRender: MeshTileRender = this.meshService.getMeshTileRender(
      object.meshElementId,
    ) as MeshTileRender;
    const centerX = meshTileRender.center.x + object.meshElementCenterRelativeX;
    const centerY = meshTileRender.center.y + object.meshElementCenterRelativeY;
    return {
      center: {
        x: centerX,
        y: centerY,
      },
      topLeft: {
        x: centerX - halfIconSize,
        y: centerY - halfIconSize,
      },
    };
  }

  public isPointInBoundingRect(
    pointX: number,
    pointY: number,
    iconCenterX: number,
    iconCenterY: number,
  ): boolean {
    const boundingRectCoords = this.getBoundingRectCoords(iconCenterX, iconCenterY);
    return (
      boundingRectCoords.x.min <= pointX &&
      boundingRectCoords.x.max >= pointX &&
      boundingRectCoords.y.min <= pointY &&
      boundingRectCoords.y.max >= pointY
    );
  }

  public getBoundingRectCoords(
    x: number,
    y: number,
  ): { x: { min: number; max: number }; y: { min: number; max: number } } {
    const halfIconSize = this.getIconSize() / 2;
    const scale = this.scale();
    return {
      x: {
        min: (x - halfIconSize) * scale,
        max: (x + halfIconSize) * scale,
      },
      y: {
        min: (y - halfIconSize) * scale,
        max: (y + halfIconSize) * scale,
      },
    };
  }
}
