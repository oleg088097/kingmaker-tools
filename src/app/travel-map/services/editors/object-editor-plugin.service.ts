import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { combineLatest, EMPTY, filter, first, fromEvent, merge, Subject, switchMap, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { TravelMapObjectsActions, travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type MapObjectEditState } from '../../interfaces/map-object-state';
import { CanvasElementsGetterService } from '../canvas-elements-getter.service';
import { type CanvasManagerPlugin } from '../canvas-manager-provider.service';
import { MeshRelativeCoordsCalcService } from '../mesh-relative-coords-calc.service';

@Injectable()
export class ObjectEditorPluginService implements CanvasManagerPlugin, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly canvas$ = new Subject<HTMLCanvasElement | null>();
  private readonly detach$ = new Subject<void>();
  private readonly destroyDownListener$: Subject<void> = new Subject<void>();
  private readonly destroyMoveListeners$: Subject<void> = new Subject<void>();
  private mouseMoveInProgress: boolean = false;
  private readonly canvasElementsGetterService = inject(CanvasElementsGetterService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly editObjectState: Signal<MapObjectEditState | null> = toSignal(
    this.store.select(travelMapObjectsFeature.selectEditObject),
    {
      requireSync: true,
    },
  );

  private readonly meshRelativeCoordsCalcService: MeshRelativeCoordsCalcService = inject(
    MeshRelativeCoordsCalcService,
  );

  public attach(canvasElement: HTMLCanvasElement | null): void {
    this.detach();
    if (canvasElement == null) {
      return;
    }
    this.canvas$.next(canvasElement);
  }

  constructor() {
    combineLatest([this.store.select(travelMapObjectsFeature.selectEditObject), this.canvas$])
      .pipe(
        switchMap(([editObjectState, canvasElement]) => {
          if (editObjectState != null && canvasElement != null) {
            return fromEvent<MouseEvent>(canvasElement, 'mousedown').pipe(
              takeUntil(merge(this.detach$, this.destroyDownListener$)),
            );
          } else {
            this.destroyDownListener$.next();
            return EMPTY;
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(this.registerMouseListener.bind(this));
  }

  public detach(): void {
    this.detach$.next();
  }

  public ngOnDestroy(): void {
    this.detach();
    this.destroy$.next();
  }

  private registerMouseListener(mouseDownEvent: MouseEvent): void {
    const editObjectState = this.editObjectState();
    if (editObjectState == null) {
      return;
    }
    const objectIds = this.canvasElementsGetterService.getEditObjectElementFromEvent(mouseDownEvent);
    if (!objectIds.includes(editObjectState.id as string)) {
      return;
    }
    this.mouseMoveInProgress = false;
    this.destroyMoveListeners$.next();
    const mouseup$ = fromEvent<MouseEvent>(document.body, 'mouseup').pipe(
      first(),
      takeUntil(merge(this.detach$, this.destroyMoveListeners$)),
    );
    mouseup$.pipe(filter(() => this.mouseMoveInProgress)).subscribe(this.objectDropHandler.bind(this));
    fromEvent<MouseEvent>(mouseDownEvent.currentTarget as HTMLElement, 'mousemove')
      .pipe(takeUntil(merge(mouseup$, this.detach$, this.destroyMoveListeners$)))
      .subscribe(this.objectDragHandler.bind(this));
  }

  private objectDropHandler(mouseUpEvent: MouseEvent): void {
    this.updateObjectPosition(mouseUpEvent);
    this.mouseMoveInProgress = false;
  }

  private objectDragHandler(mouseMoveEvent: MouseEvent): void {
    this.updateObjectPosition(mouseMoveEvent);
    this.mouseMoveInProgress = true;
  }

  private updateObjectPosition(mouseMoveEvent: MouseEvent): void {
    const editObjectState = this.editObjectState();
    if (editObjectState == null) {
      return;
    }
    const meshElementId = this.canvasElementsGetterService.getMeshElementFromEvent(mouseMoveEvent);
    if (meshElementId == null) {
      return;
    }
    const relativeCoords = this.meshRelativeCoordsCalcService.calculateRelativeCoordinates(
      mouseMoveEvent.offsetX,
      mouseMoveEvent.offsetY,
      meshElementId,
    );
    if (relativeCoords == null) {
      return;
    }
    this.store.dispatch(
      TravelMapObjectsActions.updateEditObject({
        value: {
          ...editObjectState,
          meshElementId,
          meshElementCenterRelativeX: relativeCoords.x,
          meshElementCenterRelativeY: relativeCoords.y,
        },
      }),
    );
  }
}
