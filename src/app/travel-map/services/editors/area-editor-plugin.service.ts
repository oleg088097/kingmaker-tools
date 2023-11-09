import { Injectable, inject, type OnDestroy, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { EMPTY, Subject, combineLatest, first, fromEvent, merge, switchMap, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../../+state/travel-map-area.state';
import { type MapAreaEditState } from '../../interfaces/map-area-state';
import { CanvasElementsGetterService } from '../canvas-elements-getter.service';
import { type CanvasManagerPlugin } from '../canvas-manager-provider.service';

@Injectable()
export class AreaEditorPluginService implements CanvasManagerPlugin, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly canvas$ = new Subject<HTMLCanvasElement | null>();
  private readonly detach$ = new Subject<void>();
  private readonly store: Store<TravelMapModuleState> = inject<Store<TravelMapModuleState>>(Store);
  protected readonly canvasElementsGetterService = inject(CanvasElementsGetterService);
  private readonly mouseMoveMeshIds: Set<string> = new Set<string>();
  private readonly destroyMoveUpListeners$: Subject<void> = new Subject<void>();
  private readonly destroyDownListener$: Subject<void> = new Subject<void>();
  private readonly editAreaState: Signal<MapAreaEditState | null> = toSignal(
    this.store.select(travelMapAreasFeature.selectEditArea),
    {
      requireSync: true,
    },
  );

  public attach(canvasElement: HTMLCanvasElement | null): void {
    this.detach();
    if (canvasElement == null) {
      return;
    }
    this.canvas$.next(canvasElement);
  }

  constructor() {
    combineLatest([this.store.select(travelMapAreasFeature.selectEditArea), this.canvas$])
      .pipe(
        switchMap(([editAreaState, canvasElement]) => {
          if (editAreaState != null && canvasElement != null) {
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

  private areaEditingClickHandler(event: MouseEvent): void {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return;
    }
    const meshId = this.canvasElementsGetterService.getMeshElementFromEvent(event);
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

  private registerMouseListener(mouseDownEvent: MouseEvent): void {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return;
    }
    const meshId = this.canvasElementsGetterService.getMeshElementFromEvent(mouseDownEvent);
    if (meshId == null) {
      return;
    }
    this.destroyMoveUpListeners$.next();
    let mouseMoveInProgress: boolean = false;
    this.mouseMoveMeshIds.clear();
    const mouseMoveMode = this.getAreaEditMode(mouseDownEvent);
    const mouseup$ = fromEvent<MouseEvent>(document.body, 'mouseup').pipe(
      first(),
      takeUntil(merge(this.detach$, this.destroyMoveUpListeners$)),
    );
    mouseup$.subscribe((mouseUpEvent) => {
      if (!mouseMoveInProgress) {
        this.areaEditingClickHandler(mouseUpEvent);
      }
    });
    fromEvent<MouseEvent>(mouseDownEvent.currentTarget as HTMLElement, 'mousemove')
      .pipe(takeUntil(merge(mouseup$, this.detach$, this.destroyMoveUpListeners$)))
      .subscribe((mouseMoveEvent: MouseEvent) => {
        mouseMoveInProgress = true;
        const editAreaState = this.editAreaState();
        if (editAreaState == null) {
          return;
        }
        const meshId = this.canvasElementsGetterService.getMeshElementFromEvent(mouseMoveEvent);
        if (meshId == null) {
          return;
        }
        if (this.mouseMoveMeshIds.has(meshId)) {
          return;
        }
        if (mouseMoveMode !== this.getAreaEditMode(mouseMoveEvent)) {
          return;
        }
        this.mouseMoveMeshIds.add(meshId);
        this.areaEditingHandler(meshId);
      });
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

  private getAreaEditMode(event: MouseEvent): 'add' | 'remove' | null {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return null;
    }
    const meshId = this.canvasElementsGetterService.getMeshElementFromEvent(event);
    if (meshId == null) {
      return null;
    }
    return this.getMeshIndexInAreaMeshElements(editAreaState, meshId) === -1 ? 'add' : 'remove';
  }
}
