import { computed, inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type MapObjectState } from '../../interfaces/map-object-state';
import { MESH_TYPE } from '../../interfaces/travel-map-data';
import { MapIconRegistryService } from '../map-icon-registry.service';
import { HexMeshAdapterStrategy } from '../mesh-adapters/hex-mesh-adapter-strategy';
import { type MeshAdapterStrategy, type MeshTileRender } from '../mesh-adapters/mesh-adapter-strategy';
import { type Renderer } from './renderer';

@Injectable()
export class ObjectRendererService implements Renderer, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly store: Store<TravelMapModuleState> = inject(Store);
  private readonly iconRegistry: MapIconRegistryService = inject(MapIconRegistryService);
  private readonly meshState: Signal<TravelMapMeshState> = toSignal(
    this.store.select(travelMapMeshFeature.name),
    {
      requireSync: true,
    },
  );

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  private readonly objectsState: Signal<Record<string, MapObjectState>> = toSignal(
    this.store.select(travelMapObjectsFeature.selectObjects),
    {
      requireSync: true,
    },
  );

  private readonly impl: Signal<MeshAdapterStrategy> = computed(() => {
    switch (this.meshState().meshProperties.type) {
      case MESH_TYPE.HEX:
        return new HexMeshAdapterStrategy();
      case MESH_TYPE.SQUARE:
        throw new Error('not supported');
      default:
        throw new Error('not supported');
    }
  });

  private readonly objectRenderMap = new Map<string, Path2D>();

  public render(ctx: CanvasRenderingContext2D): void {
    const meshState = this.meshState();
    const objectsState = this.objectsState();
    const rawIconDimensions = 512;
    const iconSize = meshState.meshProperties.size / 2;
    for (const object of Object.values(objectsState)) {
      if (object.hidden || object.inEdit === true) {
        continue;
      }
      this.iconRegistry
        .getIcon(object.icon, object.type)
        .pipe(takeUntil(this.destroy$))
        .subscribe((icon) => {
          const meshTileRender: MeshTileRender = this.impl().getMeshTileRender(
            object.meshElementId,
            meshState,
          );
          const objectPath = new Path2D();
          const scale = iconSize / rawIconDimensions;
          const domMatrix = new DOMMatrix()
            .translate(
              meshTileRender.center.x + object.meshElementCenterRelativeX,
              meshTileRender.center.y + object.meshElementCenterRelativeY,
            )
            .scale(scale);
          const iconPath = new Path2D(icon);
          objectPath.addPath(iconPath, domMatrix);
          this.objectRenderMap.set(object.id, objectPath);
          this.redrawObject(object.id, ctx);
        });
    }
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const eventElementIds: string[] = [];
    for (const [key, path] of this.objectRenderMap.entries()) {
      if (ctx.isPointInPath(path, x, y)) {
        eventElementIds.push(key);
      }
    }
    return eventElementIds;
  }

  private redrawObject(objectId: string, ctx: CanvasRenderingContext2D): void {
    const path = this.objectRenderMap.get(objectId);
    if (path != null) {
      ctx.save();
      const object = this.objectsState()[objectId];
      ctx.fillStyle = object.color;
      ctx.fill(path);
      ctx.restore();
    }
  }
}
