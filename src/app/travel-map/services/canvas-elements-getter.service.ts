import { inject, Injectable } from '@angular/core';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import { AreaRendererService } from './renderers/area-renderer.service';
import { MeshRendererService } from './renderers/mesh-renderer.service';
import { ObjectEditRendererService } from './renderers/object-edit-renderer.service';
import { ObjectRendererService } from './renderers/object-renderer.service';

// TODO refactor methods to remove duplicated Code
@Injectable()
export class CanvasElementsGetterService {
  private readonly meshRendererService: MeshRendererService = inject(MeshRendererService);
  private readonly areaRendererService: AreaRendererService = inject(AreaRendererService);
  private readonly objectRendererService: ObjectRendererService = inject(ObjectRendererService);
  private readonly objectEditRendererService: ObjectEditRendererService = inject(ObjectEditRendererService);

  public getMeshElementFromEvent(event: MouseEvent): string | undefined {
    const elements = document.elementsFromPoint(event.x, event.y);
    const context: CanvasRenderingContext2D | null = (
      elements.find(
        (element) => element.attributes.getNamedItem('data-overlay-type')?.value === OVERLAY_TYPE.MESH,
      ) as HTMLCanvasElement
    )?.getContext('2d');
    if (context == null) {
      return;
    }
    return this.meshRendererService.getCoordsElements(event.offsetX, event.offsetY, context).pop();
  }

  public getAreaElementsFromEvent(event: MouseEvent): string[] {
    const elements = document.elementsFromPoint(event.x, event.y);
    const context: CanvasRenderingContext2D | null = (
      elements.find(
        (element) => element.attributes.getNamedItem('data-overlay-type')?.value === OVERLAY_TYPE.AREA,
      ) as HTMLCanvasElement
    )?.getContext('2d');
    if (context == null) {
      return [];
    }
    const areaIds = this.areaRendererService.getCoordsElements(event.offsetX, event.offsetY, context);
    return areaIds;
  }

  public getObjectElementsFromEvent(event: MouseEvent): string[] {
    const elements = document.elementsFromPoint(event.x, event.y);
    const context: CanvasRenderingContext2D | null = (
      elements.find(
        (element) => element.attributes.getNamedItem('data-overlay-type')?.value === OVERLAY_TYPE.OBJECT,
      ) as HTMLCanvasElement
    )?.getContext('2d');
    if (context == null) {
      return [];
    }
    const objectIds = this.objectRendererService.getCoordsElements(event.offsetX, event.offsetY, context);
    return objectIds;
  }

  public getEditObjectElementFromEvent(event: MouseEvent): string[] {
    const elements = document.elementsFromPoint(event.x, event.y);
    const context: CanvasRenderingContext2D | null = (
      elements.find(
        (element) => element.attributes.getNamedItem('data-overlay-type')?.value === OVERLAY_TYPE.OBJECT_EDIT,
      ) as HTMLCanvasElement
    )?.getContext('2d');
    if (context == null) {
      return [];
    }
    const objectIds = this.objectEditRendererService.getCoordsElements(event.offsetX, event.offsetY, context);
    return objectIds;
  }
}
