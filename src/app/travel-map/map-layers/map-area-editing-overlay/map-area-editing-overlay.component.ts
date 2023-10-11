import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  type ElementRef,
  type Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subject, first, fromEvent, merge, takeUntil } from 'rxjs';
import { type TravelMapModuleState } from '../../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../../+state/travel-map-area.state';
import { DestroyService } from '../../../utils/destroy.service';
import { OVERLAY_TYPE } from '../../constants/overlay-type';
import { type MapAreaState } from '../../interfaces/map-area-state';
import { CanvasElementsGetterService } from '../../services/canvas-elements-getter.service';
import { CanvasManagerProviderService } from '../../services/canvas-manager-provider.service';
import { EditAreaRendererService } from '../../services/renderers/edit-area-renderer.service';

// TODO add initial borders highlight for editing area

@Component({
  selector: 'app-map-area-editing-overlay',
  templateUrl: './map-area-editing-overlay.component.html',
  styleUrls: ['./map-area-editing-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DestroyService],
})
export class MapAreaEditingOverlayComponent {
  @ViewChild('canvasElement', { static: true }) set canvasElement(
    canvasElement: ElementRef<HTMLCanvasElement>,
  ) {
    if (canvasElement == null) {
      return;
    }
    this.canvasManager.setCanvasContext(canvasElement.nativeElement.getContext('2d'));
    fromEvent<MouseEvent>(canvasElement.nativeElement, 'mousedown')
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.registerMouseListener.bind(this, canvasElement.nativeElement));
  }

  protected readonly overlayType = OVERLAY_TYPE.AREA_EDIT;
  private readonly destroy$ = inject(DestroyService);
  protected readonly editAreaService = inject(EditAreaRendererService);
  protected readonly canvasManager = inject(CanvasManagerProviderService).provideCanvasManager(
    this.editAreaService,
  );

  protected readonly canvasElementsGetterService = inject(CanvasElementsGetterService);
  private readonly store: Store<TravelMapModuleState> = inject(Store);
  private readonly editAreaState: Signal<Partial<MapAreaState> | null> = toSignal(
    this.store.select(travelMapAreasFeature.selectEditArea),
    {
      requireSync: true,
    },
  );

  private readonly mouseMoveMeshIds: Set<string> = new Set<string>();
  private readonly destroyMoveListeners$: Subject<void> = new Subject<void>();

  protected areaEditingClickHandler(event: MouseEvent): void {
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

  private getMeshIndexInAreaMeshElements(editAreaState: Partial<MapAreaState>, meshId: string): number {
    return editAreaState.meshElementIds?.findIndex((id) => id === meshId) ?? -1;
  }

  private registerMouseListener(htmlElement: HTMLElement, mouseDownEvent: MouseEvent): void {
    const editAreaState = this.editAreaState();
    if (editAreaState == null) {
      return;
    }
    const meshId = this.canvasElementsGetterService.getMeshElementFromEvent(mouseDownEvent);
    if (meshId == null) {
      return;
    }
    this.destroyMoveListeners$.next();
    let mouseMoveInProgress: boolean = false;
    this.mouseMoveMeshIds.clear();
    const mouseMoveMode = this.getAreaEditMode(mouseDownEvent);
    const mouseup$ = fromEvent<MouseEvent>(document.body, 'mouseup').pipe(
      first(),
      takeUntil(merge(this.destroy$, this.destroyMoveListeners$)),
    );
    mouseup$.subscribe((mouseUpEvent) => {
      if (!mouseMoveInProgress) {
        this.areaEditingClickHandler(mouseUpEvent);
      }
    });
    fromEvent<MouseEvent>(htmlElement, 'mousemove')
      .pipe(takeUntil(merge(mouseup$, this.destroy$, this.destroyMoveListeners$)))
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
