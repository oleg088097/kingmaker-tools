import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { DEFAULT_OBJECT_FILL_COLOR } from '../../constants/default-color';
import { type MapObjectEditState } from '../../interfaces/map-object-state';
import { IconCoordsCalculatorService } from '../icon-coords-calculator.service';
import { MapIconRegistryService } from '../map-icon-registry.service';
import { type MeshTileRender } from '../mesh-adapters/mesh-adapter-strategy';
import { MeshRendererService } from './mesh-renderer.service';
import { type Renderer } from './renderer';

// TODO highlight mesh with editable object
@Injectable()
export class ObjectEditRendererService implements Renderer, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly iconRegistry: MapIconRegistryService = inject(MapIconRegistryService);
  private readonly iconCoordsCalculatorService: IconCoordsCalculatorService =
    inject(IconCoordsCalculatorService);

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  private readonly editObjectState: Signal<MapObjectEditState | null> = toSignal(
    this.store.select(travelMapObjectsFeature.selectEditObject),
    {
      requireSync: true,
    },
  );

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

    const rawIconDimensions = 512;
    const iconSize = this.iconCoordsCalculatorService.getIconSize();
    this.iconRegistry
      .getIcon(editObjectState.icon, editObjectState.type)
      .pipe(takeUntil(this.destroy$))
      .subscribe((icon) => {
        const meshTileRender: MeshTileRender = this.meshService.getMeshTileRender(
          editObjectState.meshElementId,
        ) as MeshTileRender;
        const objectPath = new Path2D();
        const scale = iconSize / rawIconDimensions;
        const halfIconSize = iconSize / 2;
        const domMatrix = new DOMMatrix()
          .translate(
            meshTileRender.center.x + editObjectState.meshElementCenterRelativeX - halfIconSize,
            meshTileRender.center.y + editObjectState.meshElementCenterRelativeY - halfIconSize,
          )
          .scale(scale);
        const iconPath = new Path2D(icon);
        objectPath.addPath(iconPath, domMatrix);
        this.editObjectRender = {
          path: objectPath,
          centerPoint: {
            x: meshTileRender.center.x + editObjectState.meshElementCenterRelativeX,
            y: meshTileRender.center.y + editObjectState.meshElementCenterRelativeY,
          },
        };
        this.redrawObject(editObjectState, ctx);
      });
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const editObjectState = this.editObjectState();
    if (
      editObjectState?.id != null &&
      this.editObjectRender != null &&
      this.iconCoordsCalculatorService.isPointInBoundingRect(
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
      ctx.fillStyle = editObjectState.color ?? DEFAULT_OBJECT_FILL_COLOR;
      ctx.fill(render.path);
      ctx.restore();
    }
  }
}
