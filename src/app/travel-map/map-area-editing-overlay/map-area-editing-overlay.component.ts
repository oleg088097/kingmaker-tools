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
import { type TravelMapModuleState } from '../+state/+module-state';
import { TravelMapAreasActions, travelMapAreasFeature } from '../+state/travel-map-area.state';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import { type MapAreaState } from '../interfaces/map-area-state';
import { CanvasElementsGetterService } from '../services/canvas-elements-getter.service';
import { CanvasManagerProviderService } from '../services/canvas-manager-provider.service';
import { EditAreaRendererService } from '../services/renderers/edit-area-renderer.service';

@Component({
  selector: 'app-map-area-editing-overlay',
  templateUrl: './map-area-editing-overlay.component.html',
  styleUrls: ['./map-area-editing-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapAreaEditingOverlayComponent {
  @ViewChild('canvasElement', { static: true }) set canvasElement(
    canvasElement: ElementRef<HTMLCanvasElement>,
  ) {
    this.canvasManager.setCanvasContext(canvasElement.nativeElement.getContext('2d'));
  }

  protected readonly overlayType = OVERLAY_TYPE.AREA_EDIT;
  protected readonly editAreaService = inject(EditAreaRendererService);
  private readonly store: Store<TravelMapModuleState> = inject(Store);
  private readonly editAreaState: Signal<Partial<MapAreaState> | null> = toSignal(
    this.store.select(travelMapAreasFeature.selectEditArea),
    {
      requireSync: true,
    },
  );

  protected readonly canvasManager = inject(CanvasManagerProviderService).provideCanvasManager(
    this.editAreaService,
  );

  protected readonly canvasElementsGetterService = inject(CanvasElementsGetterService);

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

    const index = editAreaState.meshElementIds?.findIndex((id) => id === meshId);
    const meshElementIds =
      index != null && index !== -1
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
}
