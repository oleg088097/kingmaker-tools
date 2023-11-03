import { inject, Injectable } from '@angular/core';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import { AreaRendererService } from './renderers/area-renderer.service';
import { MeshRendererService } from './renderers/mesh-renderer.service';
import { ObjectEditRendererService } from './renderers/object-edit-renderer.service';
import { ObjectRendererService } from './renderers/object-renderer.service';
import { type Renderer } from './renderers/renderer';

@Injectable()
export class CanvasElementsGetterService {
  private readonly meshRendererService: MeshRendererService = inject(MeshRendererService);
  private readonly areaRendererService: AreaRendererService = inject(AreaRendererService);
  private readonly objectRendererService: ObjectRendererService = inject(ObjectRendererService);
  private readonly objectEditRendererService: ObjectEditRendererService = inject(ObjectEditRendererService);

  public getMeshElementFromEvent(event: MouseEvent): string | undefined {
    return this.getMeshElementsFromEvent(event, OVERLAY_TYPE.MESH, this.meshRendererService).pop();
  }

  public getAreaElementsFromEvent(event: MouseEvent): string[] {
    return this.getMeshElementsFromEvent(event, OVERLAY_TYPE.AREA, this.areaRendererService);
  }

  public getObjectElementsFromEvent(event: MouseEvent): string[] {
    return this.getMeshElementsFromEvent(event, OVERLAY_TYPE.OBJECT, this.objectRendererService);
  }

  public getEditObjectElementFromEvent(event: MouseEvent): string[] {
    return this.getMeshElementsFromEvent(event, OVERLAY_TYPE.OBJECT_EDIT, this.objectEditRendererService);
  }

  private getMeshElementsFromEvent(
    event: MouseEvent,
    overlayType: OVERLAY_TYPE,
    renderer: Renderer,
  ): string[] {
    const element = document.querySelector(`canvas[data-overlay-type=${overlayType}]`);
    const context: CanvasRenderingContext2D | null = (element as HTMLCanvasElement)?.getContext('2d');
    if (context == null) {
      return [];
    }
    return renderer.getCoordsElements(event.offsetX, event.offsetY, context);
  }
}
