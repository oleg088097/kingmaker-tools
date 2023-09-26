import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Injector,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { TravelMapModuleState } from '../+state/+module-state';
import { TravelMapAreasActions } from '../+state/travel-map-area.state';
import { TravelMapMeshActions } from '../+state/travel-map-mesh.state';
import { TravelMapObjectsActions } from '../+state/travel-map-objects.state';

import { toSignal } from '@angular/core/rxjs-interop';
import { travelMapDisplaySettingsFeature } from '../+state/travel-map-display-settings.state';
import { DestroyService } from '../../utils/destroy.service';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import {
  CONTEXT_MENU_DATA,
  ContextMenuComponent,
  ContextMenuData,
  OVERLAY_REF,
} from '../context-menu/context-menu.component';
import { TravelMapData } from '../interfaces/travel-map-data';
import { AreaService } from '../services/area.service';
import { MeshService } from '../services/mesh.service';

@Component({
  selector: 'app-travel-map',
  templateUrl: './travel-map.component.html',
  styleUrls: ['./travel-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class TravelMapComponent {
  protected loading: WritableSignal<boolean> = signal(true);
  protected destroy$ = inject(DestroyService);
  private httpClient: HttpClient = inject(HttpClient);
  private overlay: Overlay = inject(Overlay);
  protected store: Store<TravelMapModuleState> = inject(Store);
  protected travelMapDisplaySettingsState = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.name),
    { requireSync: true },
  );
  protected meshService = inject(MeshService);
  protected areaService = inject(AreaService);

  @HostBinding('style.width.px') protected get width(): number {
    return 6450 * this.travelMapDisplaySettingsState().scale;
  }

  @HostBinding('style.height.px') protected get height(): number {
    return 2250 * this.travelMapDisplaySettingsState().scale;
  }

  constructor() {
    this.httpClient
      .get<TravelMapData>('/assets/data/travel-map-elements.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.store.dispatch(TravelMapMeshActions.fromSeed({ data }));
        this.store.dispatch(TravelMapAreasActions.fromSeed({ data }));
        this.store.dispatch(TravelMapObjectsActions.fromSeed({ data }));
        this.loading.set(false);
      });
  }

  private getMeshElementFromEvent(event: MouseEvent): string | undefined {
    const elements = document.elementsFromPoint(event.x, event.y);
    const context: CanvasRenderingContext2D | null = (
      elements.find(
        (element) => element.attributes.getNamedItem('data-overlay-type')?.value === OVERLAY_TYPE.MESH,
      ) as HTMLCanvasElement
    )?.getContext('2d');
    if (!context) {
      return;
    }
    return this.meshService.getCoordsElements(event.offsetX, event.offsetY, context).pop();
  }

  private getAreaElementsFromEvent(event: MouseEvent): string[] {
    const elements = document.elementsFromPoint(event.x, event.y);
    const context: CanvasRenderingContext2D | null = (
      elements.find(
        (element) => element.attributes.getNamedItem('data-overlay-type')?.value === OVERLAY_TYPE.AREA,
      ) as HTMLCanvasElement
    )?.getContext('2d');
    if (!context) {
      return [];
    }
    const areaIds = this.areaService.getCoordsElements(event.offsetX, event.offsetY, context);
    return areaIds;
  }

  protected openContextMenu(event: MouseEvent) {
    const meshId = this.getMeshElementFromEvent(event);
    if (!meshId) {
      return;
    }
    const areaIds = this.getAreaElementsFromEvent(event);
    event.preventDefault();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({
        x: event.x,
        y: event.y,
      })
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
      ]);

    const overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    const contextMenuData: ContextMenuData = {
      meshId,
      areaIds: areaIds,
      objectIds: [],
    };
    const portal = new ComponentPortal(
      ContextMenuComponent,
      null,
      Injector.create({
        providers: [
          {
            provide: CONTEXT_MENU_DATA,
            useValue: contextMenuData,
          },
          { provide: OVERLAY_REF, useValue: overlayRef },
        ],
      }),
    );
    overlayRef.attach(portal);
    overlayRef
      .backdropClick()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => overlayRef.dispose());
  }
}
