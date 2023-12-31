import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Injector,
  inject,
  signal,
  type WritableSignal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs';
import { TravelMapActions, type TravelMapModuleState } from '../+state/+module-state';
import { DestroyService } from '../../utils/destroy.service';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import {
  CONTEXT_MENU_DATA,
  ContextMenuComponent,
  OVERLAY_REF,
  type ContextMenuData,
} from '../context-menu/context-menu.component';
import { type TravelMapData } from '../interfaces/travel-map-data';
import { CanvasElementsGetterService } from '../services/canvas-elements-getter.service';
import { CanvasManagerProviderService } from '../services/canvas-manager-provider.service';
import { pointerEventToCoords } from '../utils/event-coords-converter';

@Component({
  selector: 'app-travel-map',
  templateUrl: './travel-map.component.html',
  styleUrls: ['./travel-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class TravelMapComponent {
  protected readonly destroy$ = inject(DestroyService);
  protected readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  protected readonly canvasManagerProviderService = inject(CanvasManagerProviderService);
  protected readonly canvasElementsGetterService = inject(CanvasElementsGetterService);
  protected readonly OVERLAY_TYPE = OVERLAY_TYPE;
  protected readonly loading: WritableSignal<boolean> = signal(true);
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly overlay: Overlay = inject(Overlay);

  @HostBinding('style.width.px') protected get width(): number {
    return this.canvasManagerProviderService.canvasWidth();
  }

  @HostBinding('style.height.px') protected get height(): number {
    return this.canvasManagerProviderService.canvasHeight();
  }

  constructor() {
    this.httpClient
      .get<TravelMapData>('/assets/data/travel-map-elements.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.store.dispatch(TravelMapActions.fromSeed({ data }));
        this.loading.set(false);
      });
  }

  protected openContextMenu(event: MouseEvent): void {
    const meshId = this.canvasElementsGetterService.getMeshElementFromCoords(pointerEventToCoords(event));
    const areaIds = this.canvasElementsGetterService.getAreaElementsFromCoords(pointerEventToCoords(event));
    const objectIds = this.canvasElementsGetterService.getObjectElementsFromCoords(
      pointerEventToCoords(event),
    );
    event.preventDefault();
    event.stopPropagation();
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
      areaIds,
      objectIds,
      event,
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
      .subscribe(() => {
        overlayRef.dispose();
      });
  }
}
