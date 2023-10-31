import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type MapObjectState } from '../../interfaces/map-object-state';
import { MapIconRegistryService } from '../map-icon-registry.service';
import { ObjectCoordsCalculatorService } from '../object-coords-calculator.service';
import { MeshRendererService } from './mesh-renderer.service';
import { type Renderer } from './renderer';

@Injectable()
export class ObjectRendererService implements Renderer, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly iconRegistry: MapIconRegistryService = inject(MapIconRegistryService);
  private readonly objectCoordsCalculatorService: ObjectCoordsCalculatorService = inject(
    ObjectCoordsCalculatorService,
  );

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
    const objectsState = this.objectsState();
    for (const object of Object.values(objectsState)) {
      if (object.hidden || object.inEdit === true) {
        continue;
      }
      this.iconRegistry
        .getIcon(object.icon, object.type)
        .pipe(takeUntil(this.destroy$))
        .subscribe((icon) => {
          const objectPath = new Path2D();
          const objectScale = this.objectCoordsCalculatorService.getObjectIconScale(icon);
          const objectPosition = this.objectCoordsCalculatorService.calculateObjectPosition(object);
          const domMatrix = new DOMMatrix()
            .translate(objectPosition.topLeft.x, objectPosition.topLeft.y)
            .scale(objectScale);
          const iconPath = new Path2D(icon);
          objectPath.addPath(iconPath, domMatrix);
          this.objectRenderMap.set(object.id, {
            path: objectPath,
            centerPoint: objectPosition.center,
          });
          this.redrawObject(object.id, ctx);
        });
    }
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const eventElementIds: string[] = [];
    for (const [key, render] of this.objectRenderMap.entries()) {
      if (
        this.objectCoordsCalculatorService.isPointInBoundingRect(
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
