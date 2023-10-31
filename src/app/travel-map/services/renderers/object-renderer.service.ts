import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type MapObjectState } from '../../interfaces/map-object-state';
import { IconCoordsCalculatorService } from '../icon-coords-calculator.service';
import { MapIconRegistryService } from '../map-icon-registry.service';
import { type MeshTileRender } from '../mesh-adapters/mesh-adapter-strategy';
import { MeshRendererService } from './mesh-renderer.service';
import { type Renderer } from './renderer';

@Injectable()
export class ObjectRendererService implements Renderer, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly iconRegistry: MapIconRegistryService = inject(MapIconRegistryService);
  private readonly iconCoordsCalculatorService: IconCoordsCalculatorService =
    inject(IconCoordsCalculatorService);

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

  private readonly objectRenderMap = new Map<
    string,
    {
      path: Path2D;
      centerPoint: { x: number; y: number };
    }
  >();

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
          const meshTileRender: MeshTileRender = this.meshService.getMeshTileRender(
            object.meshElementId,
          ) as MeshTileRender;
          const objectPath = new Path2D();
          const scale = iconSize / rawIconDimensions;
          const halfIconSize = iconSize / 2;
          const domMatrix = new DOMMatrix()
            .translate(
              meshTileRender.center.x + object.meshElementCenterRelativeX - halfIconSize,
              meshTileRender.center.y + object.meshElementCenterRelativeY - halfIconSize,
            )
            .scale(scale);
          const iconPath = new Path2D(icon);
          objectPath.addPath(iconPath, domMatrix);
          this.objectRenderMap.set(object.id, {
            path: objectPath,
            centerPoint: {
              x: meshTileRender.center.x + object.meshElementCenterRelativeX,
              y: meshTileRender.center.y + object.meshElementCenterRelativeY,
            },
          });
          this.redrawObject(object.id, ctx);
        });
    }
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const eventElementIds: string[] = [];
    for (const [key, render] of this.objectRenderMap.entries()) {
      if (
        this.iconCoordsCalculatorService.isPointInBoundingRect(
          x,
          y,
          render.centerPoint.x,
          render.centerPoint.y,
        )
      ) {
        eventElementIds.push(key);
      }
    }
    return eventElementIds;
  }

  private redrawObject(objectId: string, ctx: CanvasRenderingContext2D): void {
    const render = this.objectRenderMap.get(objectId);
    if (render != null) {
      ctx.save();
      const object = this.objectsState()[objectId];
      ctx.fillStyle = object.color;
      ctx.fill(render.path);
      ctx.restore();
    }
  }
}
