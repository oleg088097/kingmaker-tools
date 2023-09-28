import { inject, Injectable } from '@angular/core';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import { AreaRendererService } from './renderers/area-renderer.service';
import { MeshRendererService } from './renderers/mesh-renderer.service';

@Injectable()
export class CanvasElementsGetterService {
  private readonly meshService: MeshRendererService = inject(MeshRendererService);
  private readonly areaService: AreaRendererService = inject(AreaRendererService);

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
    return this.meshService.getCoordsElements(event.offsetX, event.offsetY, context).pop();
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
    const areaIds = this.areaService.getCoordsElements(event.offsetX, event.offsetY, context);
    return areaIds;
  }
}
