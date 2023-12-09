import { inject, Injectable } from '@angular/core';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import { type Coordinates } from '../interfaces/coordinates';
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

  // { type?: never } to prevent Events (MouseEvent) as coords param
  public getMeshElementFromCoords(coords: Coordinates & { type?: never }): string | undefined {
    return this.getMeshElementsFromCoords(coords, OVERLAY_TYPE.MESH, this.meshRendererService).pop();
  }

  public getAreaElementsFromCoords(coords: Coordinates & { type?: never }): string[] {
    return this.getMeshElementsFromCoords(coords, OVERLAY_TYPE.AREA, this.areaRendererService);
  }

  public getObjectElementsFromCoords(coords: Coordinates & { type?: never }): string[] {
    return this.getMeshElementsFromCoords(coords, OVERLAY_TYPE.OBJECT, this.objectRendererService);
  }

  public getEditObjectElementFromCoords(coords: Coordinates & { type?: never }): string[] {
    return this.getMeshElementsFromCoords(coords, OVERLAY_TYPE.OBJECT_EDIT, this.objectEditRendererService);
  }

  private getMeshElementsFromCoords(
    coords: Coordinates,
    overlayType: OVERLAY_TYPE,
    renderer: Renderer,
  ): string[] {
    const element = document.querySelector(`canvas[data-overlay-type=${overlayType}]`);
    const context: CanvasRenderingContext2D | null = (element as HTMLCanvasElement)?.getContext('2d');
    if (context == null) {
      return [];
    }
    return renderer.getCoordsElements(coords.x, coords.y, context);
  }
}
