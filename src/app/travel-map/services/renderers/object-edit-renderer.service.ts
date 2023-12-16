import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type MapObjectEditState } from '../../interfaces/map-object-state';
import { MapIconRegistryService } from '../map-icon-registry.service';
import { ObjectCoordsCalculatorService } from '../object-coords-calculator.service';
import { type Renderer } from './renderer';

// TODO highlight mesh with editable object
@Injectable()
export class ObjectEditRendererService implements Renderer, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly iconRegistry: MapIconRegistryService = inject(MapIconRegistryService);
  private readonly editObjectState: Signal<MapObjectEditState | null> = this.store.selectSignal(
    travelMapObjectsFeature.selectEditObject,
  );

  private readonly objectCoordsCalculatorService: ObjectCoordsCalculatorService = inject(
    ObjectCoordsCalculatorService,
  );

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  private editObjectRender: {
    path: Path2D;
    centerPoint: { x: number; y: number };
  } | null = null;

  public render(ctx: CanvasRenderingContext2D): void {
    const editObjectState = this.editObjectState();

    if (editObjectState == null) {
      this.editObjectRender = null;
      return;
    }

    this.iconRegistry
      .getIcon(editObjectState.icon, editObjectState.type)
      .pipe(takeUntil(this.destroy$))
      .subscribe((icon) => {
        const objectPath = new Path2D();
        const objectPosition = this.objectCoordsCalculatorService.calculateObjectPosition(editObjectState);
        const objectScale = this.objectCoordsCalculatorService.getObjectIconScale(icon);
        const domMatrix = new DOMMatrix()
          .translate(objectPosition.topLeft.x, objectPosition.topLeft.y)
          .scale(objectScale);
        const iconPath = new Path2D(icon);
        objectPath.addPath(iconPath, domMatrix);
        this.editObjectRender = {
          path: objectPath,
          centerPoint: objectPosition.center,
        };
        this.redrawObject(editObjectState, ctx);
      });
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const editObjectState = this.editObjectState();
    if (
      editObjectState?.id != null &&
      this.editObjectRender != null &&
      this.objectCoordsCalculatorService.isPointInBoundingRect(
        x,
        y,
        this.editObjectRender.centerPoint.x,
        this.editObjectRender.centerPoint.y,
      )
    ) {
      return [editObjectState.id];
    }
    return [];
  }

  private redrawObject(editObjectState: MapObjectEditState, ctx: CanvasRenderingContext2D): void {
    const render = this.editObjectRender;
    if (render != null) {
      ctx.save();
      ctx.fillStyle = editObjectState.color;
      ctx.fill(render.path);
      ctx.restore();
    }
  }
}
