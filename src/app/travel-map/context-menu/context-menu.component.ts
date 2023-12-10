import { type OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, InjectionToken, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { combineLatest, map, takeUntil } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { type TravelMapModuleState } from '../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../+state/travel-map-area.state';
import { TravelMapMeshActions, travelMapMeshFeature } from '../+state/travel-map-mesh.state';
import { TravelMapObjectsActions, travelMapObjectsFeature } from '../+state/travel-map-objects.state';
import { DestroyService } from '../../utils/destroy.service';
import { DEFAULT_OBJECT_ICON } from '../constants/default-object-icon';
import { type MapAreaEditState, type MapAreaState } from '../interfaces/map-area-state';
import { ICON_TYPE, type MapObjectEditState, type MapObjectState } from '../interfaces/map-object-state';
import { type MeshElementState } from '../interfaces/mesh-element-state';
import { MeshRelativeCoordsCalcService } from '../services/mesh-relative-coords-calc.service';
import { getRandomColor } from '../utils/color.utils';

export interface ContextMenuData {
  meshId?: string;
  areaIds: string[];
  objectIds: string[];
  event: MouseEvent;
}

export const CONTEXT_MENU_DATA: InjectionToken<ContextMenuData> = new InjectionToken<ContextMenuData>(
  'CONTEXT_MENU_DATA',
);
export const OVERLAY_REF: InjectionToken<OverlayRef> = new InjectionToken<OverlayRef>('OVERLAY_REF');

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class ContextMenuComponent {
  private readonly data: ContextMenuData = inject(CONTEXT_MENU_DATA);
  private readonly overlayRef: OverlayRef = inject(OVERLAY_REF);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly destroy$ = inject(DestroyService);
  private readonly meshRelativeCoordsCalcService: MeshRelativeCoordsCalcService = inject(
    MeshRelativeCoordsCalcService,
  );

  protected mesh: Signal<MeshElementState | null> = toSignal(
    this.store.select(travelMapMeshFeature.selectMeshMap).pipe(
      map((meshMap) => (this.data.meshId !== undefined ? meshMap[this.data.meshId] : null)),
      takeUntil(this.destroy$),
    ),
    { requireSync: true },
  );

  protected areas: Signal<MapAreaState[]> = toSignal(
    this.store.select(travelMapAreasFeature.selectAreas).pipe(
      map((areaMap) => this.data.areaIds.map((areaId) => areaMap[areaId])),
      takeUntil(this.destroy$),
    ),
    { requireSync: true },
  );

  protected objects: Signal<MapObjectState[]> = toSignal(
    this.store.select(travelMapObjectsFeature.selectObjects).pipe(
      map((areaMap) => this.data.objectIds.map((objectId) => areaMap[objectId])),
      takeUntil(this.destroy$),
    ),
    { requireSync: true },
  );

  protected hasEditState: Signal<boolean> = toSignal(
    combineLatest([
      this.store.select(travelMapObjectsFeature.selectEditObject),
      this.store.select(travelMapAreasFeature.selectEditArea),
    ]).pipe(map(([editObject, editArea]) => Boolean(editObject ?? editArea))),
    {
      requireSync: true,
    },
  );

  protected switchFogForMeshElement(mesh: MeshElementState): void {
    this.store.dispatch(
      TravelMapMeshActions.upsertMeshElement({
        value: {
          ...mesh,
          fog: !mesh.fog,
        },
      }),
    );
    this.overlayRef.dispose();
  }

  protected editArea(area: MapAreaEditState): void {
    this.store.dispatch(
      TravelMapAreasActions.updateEditArea({
        value: {
          ...area,
        },
      }),
    );
    this.overlayRef.dispose();
  }

  protected editObject(object: MapObjectEditState | null): void {
    if (object === null) {
      this.overlayRef.dispose();
      return;
    }
    this.store.dispatch(
      TravelMapObjectsActions.updateEditObject({
        value: {
          ...object,
        },
      }),
    );
    this.overlayRef.dispose();
  }

  protected getEmptyAreaState(): MapAreaEditState {
    return {
      id: uuidv4(),
      title: '',
      color: getRandomColor(),
      meshElementIds: [],
      type: '',
    };
  }

  protected getDefaultObjectState(mesh: MeshElementState): MapObjectEditState | null {
    const relativeCoords = this.meshRelativeCoordsCalcService.calculateRelativeCoordinates(
      this.data.event.offsetX,
      this.data.event.offsetY,
      mesh.id,
    );

    if (relativeCoords === null) {
      return null;
    }
    return {
      id: uuidv4(),
      title: '',
      color: getRandomColor(),
      icon: DEFAULT_OBJECT_ICON,
      type: ICON_TYPE.default,
      meshElementId: mesh.id,
      meshElementCenterRelativeX: relativeCoords.x,
      meshElementCenterRelativeY: relativeCoords.y,
    };
  }
}
