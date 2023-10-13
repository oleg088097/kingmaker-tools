import { computed, effect, inject, Injectable, signal, type WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { type TravelMapModuleState } from '../+state/+module-state';
import { travelMapDisplaySettingsFeature } from '../+state/travel-map-display-settings.state';
import { travelMapImageFeature } from '../+state/travel-map-image.state';
import { type Renderer } from './renderers/renderer';

export interface CanvasManagerPlugin {
  attach: (canvasElement: HTMLCanvasElement | null) => void;
  detach: () => void;
}

export interface CanvasManager {
  setCanvas: (ctx: HTMLCanvasElement | null) => CanvasManager;
  setRenderer: (ctx: Renderer | null) => CanvasManager;
  addPlugin: (ctx: CanvasManagerPlugin | null) => CanvasManager;
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

  public provideCanvasManager(): CanvasManager {
    const scale = this.scale;
    const canvasWidth = this.canvasWidth;
    const canvasHeight = this.canvasHeight;
    return new (class implements CanvasManager {
      private readonly canvas: WritableSignal<HTMLCanvasElement | null> = signal(null);
      private readonly rerender: WritableSignal<Renderer | null> = signal(null);
      private readonly plugins: CanvasManagerPlugin[] = [];

      public setCanvas(ctx: HTMLCanvasElement | null): CanvasManager {
        this.canvas.set(ctx);
        return this;
      }

      public setRenderer(rerender: Renderer | null): CanvasManager {
        this.rerender.set(rerender);
        return this;
      }

      public addPlugin(plugin: CanvasManagerPlugin | null): CanvasManager {
        if (plugin !== null) {
          plugin.attach(this.canvas());
          this.plugins.push(plugin);
        }
        return this;
      }

      constructor() {
        effect(() => {
          const canvas = this.canvas();
          const ctx = canvas?.getContext('2d');
          const rerender = this.rerender();
          if (ctx != null && rerender != null) {
            ctx.canvas.width = canvasWidth();
            ctx.canvas.height = canvasHeight();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.scale(scale(), scale());
            rerender?.render(ctx);
          }
        });
        effect(() => {
          const canvas = this.canvas();
          for (const plugin of this.plugins) {
            plugin.detach();
            plugin.attach(canvas);
          }
        });
      }
    })();
  }
}
