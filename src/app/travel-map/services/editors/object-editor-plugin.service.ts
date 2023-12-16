import { inject, Injectable, type OnDestroy, type Signal } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  first,
  fromEvent,
  map,
  merge,
  Subject,
  switchMap,
  takeUntil,
  type Observable,
} from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { TravelMapObjectsActions, travelMapObjectsFeature } from '../../+state/travel-map-objects.state';
import { type Coordinates } from '../../interfaces/coordinates';
import { type MapObjectEditState } from '../../interfaces/map-object-state';
import { pointerEventToCoords } from '../../utils/event-coords-converter';
import { CanvasElementsGetterService } from '../canvas-elements-getter.service';
import { type CanvasManagerPlugin } from '../canvas-manager-provider.service';
import { MeshRelativeCoordsCalcService } from '../mesh-relative-coords-calc.service';

@Injectable()
export class ObjectEditorPluginService implements CanvasManagerPlugin, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly canvas$ = new Subject<HTMLCanvasElement | null>();
  private readonly detach$ = new Subject<void>();
  private readonly destroyMoveListeners$: Subject<void> = new Subject<void>();
  private isPointerMoveInProgress: boolean = false;
  private isObjectInteractionInProgress: boolean = false;
  private readonly canvasElementsGetterService = inject(CanvasElementsGetterService);
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly editObjectState: Signal<MapObjectEditState | null> = this.store.selectSignal(
    travelMapObjectsFeature.selectEditObject,
  );

  private readonly meshRelativeCoordsCalcService: MeshRelativeCoordsCalcService = inject(
    MeshRelativeCoordsCalcService,
  );

  private readonly editObjectCanvasCombination: Observable<
    [MapObjectEditState | null, HTMLCanvasElement | null]
  > = combineLatest([this.store.select(travelMapObjectsFeature.selectEditObject), this.canvas$]);

  private readonly destroyDownListener$: Observable<void> = this.editObjectCanvasCombination.pipe(
    filter((combination) => !this.isCanvasSubscribable(...combination)),
    map(() => undefined),
  );

  constructor() {
    const filteredEvents = this.editObjectCanvasCombination.pipe(
      filter((combination): combination is [MapObjectEditState, HTMLCanvasElement] =>
        this.isCanvasSubscribable(...combination),
      ),
    );
    filteredEvents
      .pipe(
        switchMap(([, canvasElement]) => {
          return fromEvent<PointerEvent>(canvasElement, 'pointerdown').pipe(
            takeUntil(merge(this.detach$, this.destroyDownListener$)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(this.registerMouseListener.bind(this));

    // Disable touchstart to prevent from panning when interacting with an object
    filteredEvents
      .pipe(
        switchMap(([, canvasElement]) => {
          return fromEvent<TouchEvent>(canvasElement, 'touchstart').pipe(
            takeUntil(merge(this.detach$, this.destroyDownListener$)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((event) => {
        if (this.isObjectInteractionInProgress) {
          event.preventDefault();
        }
      });
  }

  public attach(canvasElement: HTMLCanvasElement | null): void {
    this.detach();
    if (canvasElement == null) {
      return;
    }
    this.canvas$.next(canvasElement);
  }

  public detach(): void {
    this.detach$.next();
  }

  public ngOnDestroy(): void {
    this.detach();
    this.destroy$.next();
  }

  private isCanvasSubscribable(
    editObjectState: MapObjectEditState | null,
    canvasElement: HTMLCanvasElement | null,
  ): boolean {
    return editObjectState != null && canvasElement != null;
  }

  private registerMouseListener(downEvent: PointerEvent): void {
    if (!this.isObjectInteractionCoords(pointerEventToCoords(downEvent))) {
      return;
    }
    this.isPointerMoveInProgress = false;
    this.isObjectInteractionInProgress = true;
    this.destroyMoveListeners$.next();
    const pointerup$ = fromEvent<PointerEvent>(document.body, 'pointerup').pipe(
      first(),
      takeUntil(merge(this.detach$, this.destroyMoveListeners$)),
    );
    pointerup$.pipe(filter(() => this.isPointerMoveInProgress)).subscribe(this.objectDropHandler.bind(this));
    fromEvent<PointerEvent>(downEvent.currentTarget as HTMLElement, 'pointermove')
      .pipe(takeUntil(merge(pointerup$, this.detach$, this.destroyMoveListeners$)))
      .subscribe(this.objectDragHandler.bind(this));
  }

  private isObjectInteractionCoords(coords: Coordinates): boolean {
    const editObjectState = this.editObjectState();
    if (editObjectState == null) {
      return false;
    }
    const objectIds = this.canvasElementsGetterService.getEditObjectElementFromCoords(coords);
    return objectIds.includes(editObjectState.id as string);
  }

  private objectDropHandler(pointerupEvent: PointerEvent): void {
    this.updateObjectPosition(pointerupEvent);
    this.isPointerMoveInProgress = false;
    this.isObjectInteractionInProgress = false;
  }

  private objectDragHandler(pointermoveEvent: PointerEvent): void {
    this.updateObjectPosition(pointermoveEvent);
    this.isPointerMoveInProgress = true;
  }

  private updateObjectPosition(pointerMoveEvent: PointerEvent): void {
    const editObjectState = this.editObjectState();
    if (editObjectState == null) {
      return;
    }
    const coords = pointerEventToCoords(pointerMoveEvent);
    const meshElementId = this.canvasElementsGetterService.getMeshElementFromCoords(coords);
    if (meshElementId == null) {
      return;
    }
    const relativeCoords = this.meshRelativeCoordsCalcService.calculateRelativeCoordinates(
      coords.x,
      coords.y,
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
