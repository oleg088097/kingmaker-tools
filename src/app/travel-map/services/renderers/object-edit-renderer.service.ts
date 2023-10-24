import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { travelMapMeshFeature, type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { DEFAULT_OBJECT_FILL_COLOR } from '../../constants/default-color';
import { type MapObjectEditState } from '../../interfaces/map-object-state';
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
  private readonly meshState: Signal<TravelMapMeshState> = toSignal(
    this.store.select(travelMapMeshFeature.name),
    {
      requireSync: true,
    },
  );

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  private readonly editObjectState: Signal<MapObjectEditState | null> = toSignal(
    this.store.select(travelMapObjectsFeature.selectEditObject),
    {
      requireSync: true,
    },
  );

  private editObjectRender: Path2D | null = null;

  public render(ctx: CanvasRenderingContext2D): void {
    const meshState = this.meshState();
    const editObjectState = this.editObjectState();

    if (editObjectState == null) {
      this.editObjectRender = null;
      return;
    }

    const rawIconDimensions = 512;
    const iconSize = meshState.meshProperties.size / 2;
    this.iconRegistry
      .getIcon(editObjectState.icon, editObjectState.type)
      .pipe(takeUntil(this.destroy$))
      .subscribe((icon) => {
        const meshTileRender: MeshTileRender = this.meshService.getMeshTileRender(
          editObjectState.meshElementId,
        ) as MeshTileRender;
        const objectPath = new Path2D();
        const scale = iconSize / rawIconDimensions;
        const domMatrix = new DOMMatrix()
          .translate(
            meshTileRender.center.x + editObjectState.meshElementCenterRelativeX,
            meshTileRender.center.y + editObjectState.meshElementCenterRelativeY,
          )
          .scale(scale);
        const iconPath = new Path2D(icon);
        objectPath.addPath(iconPath, domMatrix);
        this.editObjectRender = objectPath;
        this.redrawObject(editObjectState, ctx);
      });
  }

  public getCoordsElements(x: number, y: number, ctx: CanvasRenderingContext2D): string[] {
    const editObjectState = this.editObjectState();
    if (
      editObjectState?.id != null &&
      this.editObjectRender != null &&
      ctx.isPointInPath(this.editObjectRender, x, y)
    ) {
      return [editObjectState.id];
    }
    return [];
  }

  private redrawObject(editObjectState: MapObjectEditState, ctx: CanvasRenderingContext2D): void {
    const path = this.editObjectRender;
    if (path != null) {
      ctx.save();
      ctx.fillStyle = editObjectState.color ?? DEFAULT_OBJECT_FILL_COLOR;
      ctx.fill(path);
      ctx.restore();
    }
  }
}
