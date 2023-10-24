import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { filter, first, fromEvent, merge, Subject, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { TravelMapObjectsActions, travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type MapObjectEditState } from '../../interfaces/map-object-state';
import { CanvasElementsGetterService } from '../canvas-elements-getter.service';
import { type CanvasManagerPlugin } from '../canvas-manager-provider.service';
import { MeshRelativeCoordsCalcService } from '../mesh-relative-coords-calc.service';

@Injectable()
export class ObjectEditorPluginService implements CanvasManagerPlugin, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly detach$ = new Subject<void>();
  private _canvas?: HTMLCanvasElement;

  public attach(canvasElement: HTMLCanvasElement | null): void {
    this.detach();
    if (canvasElement == null) {
      return;
    }
    this._canvas = canvasElement;
    fromEvent<MouseEvent>(canvasElement, 'mousedown')
      .pipe(takeUntil(merge(this.destroy$, this.detach$)))
      .subscribe(this.registerMouseListener.bind(this, canvasElement));
  }

  public detach(): void {
    this.detach$.next();
    this._canvas = undefined;
  }

  private readonly meshRelativeCoordsCalcService: MeshRelativeCoordsCalcService = inject(
    MeshRelativeCoordsCalcService,
  );

  private readonly canvasElementsGetterService = inject(CanvasElementsGetterService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly editObjectState: Signal<MapObjectEditState | null> = toSignal(
    this.store.select(travelMapObjectsFeature.selectEditObject),
    {
      requireSync: true,
    },
  );

  private readonly destroyMoveListeners$: Subject<void> = new Subject<void>();
  private mouseMoveInProgress: boolean = false;

  public ngOnDestroy(): void {
    this.destroy$.next();
  }

  private registerMouseListener(htmlElement: HTMLElement, mouseDownEvent: MouseEvent): void {
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
      takeUntil(merge(this.destroy$, this.detach$, this.destroyMoveListeners$)),
    );
    mouseup$.pipe(filter(() => this.mouseMoveInProgress)).subscribe(this.objectDropHandler.bind(this));
    fromEvent<MouseEvent>(htmlElement, 'mousemove')
      .pipe(takeUntil(merge(mouseup$, this.destroy$, this.detach$, this.destroyMoveListeners$)))
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
    // TODO take into account initial position of the pointer relative to icon's top-left corner
    // and decrement updated icon position by this offset
    const editObjectState = this.editObjectState();
    if (editObjectState == null) {
      return;
    }
    // TODO use not mouse position but object's center
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
