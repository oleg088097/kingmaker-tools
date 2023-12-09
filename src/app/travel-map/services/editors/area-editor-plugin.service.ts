import { Injectable, inject, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  Subject,
  combineLatest,
  filter,
  first,
  fromEvent,
  map,
  merge,
  switchMap,
  takeUntil,
  type Observable,
} from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../../+state/travel-map-area.state';
import { TouchUiService } from '../../../utils/touch-ui.service';
import { type Coordinates } from '../../interfaces/coordinates';
import { type MapAreaEditState } from '../../interfaces/map-area-state';
import { pointerEventToCoords } from '../../utils/event-coords-converter';
import { CanvasElementsGetterService } from '../canvas-elements-getter.service';
import { type CanvasManagerPlugin } from '../canvas-manager-provider.service';

@Injectable()
export class AreaEditorPluginService implements CanvasManagerPlugin, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly canvas$ = new Subject<HTMLCanvasElement | null>();
  private readonly detach$ = new Subject<void>();
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  private readonly canvasElementsGetterService = inject(CanvasElementsGetterService);
  private readonly pointerMoveMeshIds: Set<string> = new Set<string>();
  private readonly destroyMoveUpListeners$: Subject<void> = new Subject<void>();
  private readonly editAreaState: Signal<MapAreaEditState | null> = toSignal(
    this.store.select(travelMapAreasFeature.selectEditArea),
    {
      requireSync: true,
    },
  );

  private readonly editAreaCanvasCombination: Observable<
    [MapAreaEditState | null, HTMLCanvasElement | null]
  > = combineLatest([this.store.select(travelMapAreasFeature.selectEditArea), this.canvas$]);

  private readonly destroyDownListener$: Observable<void> = this.editAreaCanvasCombination.pipe(
    filter((combination) => !this.isCanvasSubscribable(...combination)),
    map(() => undefined),
  );

  protected readonly isTouchUI: Signal<boolean> = inject(TouchUiService).isTouchUI;

  constructor() {
    this.editAreaCanvasCombination
      .pipe(
        filter((combination): combination is [MapAreaEditState, HTMLCanvasElement] =>
          this.isCanvasSubscribable(...combination),
        ),
        switchMap(([, canvasElement]) => {
          return fromEvent<PointerEvent>(canvasElement, 'pointerdown').pipe(
            takeUntil(merge(this.detach$, this.destroyDownListener$)),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(this.registerMouseListener.bind(this));
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
    editObjectState: MapAreaEditState | null,
    canvasElement: HTMLCanvasElement | null,
  ): boolean {
    return editObjectState != null && canvasElement != null;
  }

  private areaEditingClickHandler(event: PointerEvent): void {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return;
    }
    const meshId = this.canvasElementsGetterService.getMeshElementFromCoords(pointerEventToCoords(event));
    if (meshId == null) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.areaEditingHandler(meshId);
  }

  private getMeshIndexInAreaMeshElements(editAreaState: MapAreaEditState, meshId: string): number {
    return editAreaState.meshElementIds?.findIndex((id) => id === meshId) ?? -1;
  }

  private registerMouseListener(downEvent: PointerEvent): void {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return;
    }
    const meshId = this.canvasElementsGetterService.getMeshElementFromCoords(pointerEventToCoords(downEvent));
    if (meshId == null) {
      return;
    }
    this.destroyMoveUpListeners$.next();
    let pointerMoveInProgress: boolean = false;
    this.pointerMoveMeshIds.clear();
    const operationForMeshElement = this.getAreaEditOperationForMeshElement(downEvent);
    const pointerup$ = fromEvent<PointerEvent>(document.body, 'pointerup').pipe(
      first(),
      takeUntil(merge(this.detach$, this.destroyMoveUpListeners$)),
    );
    pointerup$.subscribe((pointerupEvent) => {
      if (!pointerMoveInProgress) {
        this.areaEditingClickHandler(pointerupEvent);
      }
    });
    if (!this.isTouchUI()) {
      fromEvent<PointerEvent>(downEvent.currentTarget as HTMLElement, 'pointermove')
        .pipe(takeUntil(merge(pointerup$, this.detach$, this.destroyMoveUpListeners$)))
        .subscribe((pointerMoveEvent: PointerEvent) => {
          pointerMoveInProgress = true;
          const editAreaState = this.editAreaState();
          if (editAreaState == null) {
            return;
          }
          const coords = pointerEventToCoords(pointerMoveEvent);
          const meshId = this.canvasElementsGetterService.getMeshElementFromCoords(coords);
          if (meshId == null) {
            return;
          }
          if (this.pointerMoveMeshIds.has(meshId)) {
            return;
          }
          if (operationForMeshElement !== this.getAreaEditOperationForMeshElement(coords)) {
            return;
          }
          this.pointerMoveMeshIds.add(meshId);
          this.areaEditingHandler(meshId);
        });
    }
  }

  private areaEditingHandler(meshId: string): void {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return;
    }
    const index = this.getMeshIndexInAreaMeshElements(editAreaState, meshId);
    const meshElementIds =
      index !== -1
        ? editAreaState.meshElementIds?.slice(0, index).concat(editAreaState.meshElementIds?.slice(index + 1))
        : [...(editAreaState.meshElementIds ?? []), meshId];

    this.store.dispatch(
      TravelMapAreasActions.updateEditArea({
        value: {
          ...editAreaState,
          meshElementIds,
        },
      }),
    );
  }

  private getAreaEditOperationForMeshElement(coords: Coordinates): 'add' | 'remove' | null {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return null;
    }
    const meshId = this.canvasElementsGetterService.getMeshElementFromCoords(coords);
    if (meshId == null) {
      return null;
    }
    return this.getMeshIndexInAreaMeshElements(editAreaState, meshId) === -1 ? 'add' : 'remove';
  }
}
