import { type OverlayRef } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  InjectionToken,
  type Signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { DestroyService } from 'shared_destroy-service';
import { v4 as uuidv4 } from 'uuid';
import { type TravelMapModuleState } from '../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../+state/travel-map-areas.state';
import { TravelMapMeshActions, travelMapMeshFeature } from '../+state/travel-map-mesh.state';
import { TravelMapObjectsActions, travelMapObjectsFeature } from '../+state/travel-map-objects.state';
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
  protected mesh: Signal<MeshElementState | null> = this.store.selectSignal(
    travelMapMeshFeature.selectMeshById(this.data.meshId),
  );

  protected areas: Signal<MapAreaState[]> = this.store.selectSignal(
    travelMapAreasFeature.selectAreasByIds(this.data.areaIds),
  );

  protected objects: Signal<MapObjectState[]> = this.store.selectSignal(
    travelMapObjectsFeature.selectObjectsByIds(this.data.objectIds),
  );

  private readonly meshRelativeCoordsCalcService: MeshRelativeCoordsCalcService = inject(
    MeshRelativeCoordsCalcService,
  );

  private readonly selectEditObject = this.store.selectSignal(travelMapObjectsFeature.selectEditObject);
  private readonly selectEditArea = this.store.selectSignal(travelMapAreasFeature.selectEditArea);

  protected readonly hasEditState: Signal<boolean> = computed(() =>
    Boolean(this.selectEditObject() ?? this.selectEditArea()),
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

  protected deleteArea(area: MapAreaState): void {
    this.store.dispatch(
      TravelMapAreasActions.confirmDeleteArea({
        value: area,
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

  protected deleteObject(object: MapObjectState): void {
    this.store.dispatch(
      TravelMapObjectsActions.confirmDeleteObject({
        value: object,
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
