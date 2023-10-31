import { inject, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../+state/+module-state';
import { travelMapDisplaySettingsFeature } from '../+state/travel-map-display-settings.state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../+state/travel-map-mesh.state';

export class IconCoordsCalculatorService {
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);

  protected readonly scale: Signal<number> = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.selectScale),
    {
      requireSync: true,
    },
  );

  private readonly meshState: Signal<TravelMapMeshState> = toSignal(
    this.store.select(travelMapMeshFeature.name),
    {
      requireSync: true,
    },
  );

  public getIconSize(): number {
    const meshState = this.meshState();
    return meshState.meshProperties.size / 2;
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
