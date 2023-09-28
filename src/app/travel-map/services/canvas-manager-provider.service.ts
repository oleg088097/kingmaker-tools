import { computed, effect, inject, Injectable, signal, type WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../+state/+module-state';
import { travelMapDisplaySettingsFeature } from '../+state/travel-map-display-settings.state';
import { travelMapImageFeature } from '../+state/travel-map-image.state';
import { type Renderer } from './renderers/renderer';

export interface CanvasManager {
  setCanvasContext: (ctx: CanvasRenderingContext2D | null) => void;
}

@Injectable()
export class CanvasManagerProviderService {
  private readonly store: Store<TravelMapModuleState> = inject(Store);
  protected readonly scale = toSignal(this.store.select(travelMapDisplaySettingsFeature.selectScale), {
    requireSync: true,
  });

  protected readonly travelMapImageState = toSignal(this.store.select(travelMapImageFeature.selectImage), {
    requireSync: true,
  });

  public readonly canvasWidth = computed(() => this.scale() * this.travelMapImageState().width);
  public readonly canvasHeight = computed(() => this.scale() * this.travelMapImageState().height);

  public provideCanvasManager(rerender: Renderer): CanvasManager {
    const scale = this.scale;
    const canvasWidth = this.canvasWidth;
    const canvasHeight = this.canvasHeight;
    return new (class implements CanvasManager {
      private readonly ctx: WritableSignal<CanvasRenderingContext2D | null> = signal(null);
      public setCanvasContext(ctx: CanvasRenderingContext2D | null): void {
        this.ctx.set(ctx);
      }

      constructor() {
        effect(() => {
          const ctx = this.ctx();
          if (ctx != null) {
            ctx.canvas.width = canvasWidth();
            ctx.canvas.height = canvasHeight();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.scale(scale(), scale());
            rerender.render(ctx);
          }
        });
      }
    })();
  }
}
