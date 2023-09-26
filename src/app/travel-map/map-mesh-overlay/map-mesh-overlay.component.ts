import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { TravelMapModuleState } from '../+state/+module-state';
import { travelMapDisplaySettingsFeature } from '../+state/travel-map-display-settings.state';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import { MeshElementState } from '../interfaces/mesh-element-state';
import { MeshService } from '../services/mesh.service';

interface MeshElementDisplay extends MeshElementState {
  isTitleDisplayed: boolean;
  style: string;
}

@Component({
  selector: 'app-map-mesh-overlay',
  templateUrl: './map-mesh-overlay.component.html',
  styleUrls: ['./map-mesh-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapMeshOverlayComponent {
  @ViewChild('canvasElement', { static: true }) set canvasElement(
    canvasElement: ElementRef<HTMLCanvasElement>,
  ) {
    this.canvasCtx?.set(canvasElement.nativeElement.getContext('2d'));
  }
  protected canvasCtx: WritableSignal<CanvasRenderingContext2D | null> = signal(null);
  protected readonly overlayType = OVERLAY_TYPE.MESH;
  protected store: Store<TravelMapModuleState> = inject(Store);
  protected travelMapDisplaySettingsState = toSignal(
    this.store.select(travelMapDisplaySettingsFeature.name),
    { requireSync: true },
  );
  protected meshService = inject(MeshService);

  protected get canvasWidth(): number {
    return 6450 * this.travelMapDisplaySettingsState().scale;
  }

  protected get canvasHeight(): number {
    return 2250 * this.travelMapDisplaySettingsState().scale;
  }

  constructor() {
    effect(() => {
      const ctx = this.canvasCtx();
      if (ctx) {
        ctx.canvas.width = this.canvasWidth;
        ctx.canvas.height = this.canvasHeight;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.scale(this.travelMapDisplaySettingsState().scale, this.travelMapDisplaySettingsState().scale);
        this.meshService.drawMesh(ctx);
      }
    });
  }
}
