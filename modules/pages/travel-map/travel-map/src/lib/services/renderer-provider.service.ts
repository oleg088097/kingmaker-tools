import { inject, Injectable } from '@angular/core';
import { OVERLAY_TYPE } from '../constants/overlay-type';
import { AreaEditRendererService } from './renderers/area-edit-renderer.service';
import { AreaRendererService } from './renderers/area-renderer.service';
import { MeshRendererService } from './renderers/mesh-renderer.service';
import { ObjectEditRendererService } from './renderers/object-edit-renderer.service';
import { ObjectRendererService } from './renderers/object-renderer.service';
import { type Renderer } from './renderers/renderer';

@Injectable()
export class RendererProviderService {
  private readonly objectEditRendererService = inject(ObjectEditRendererService);
  private readonly objectRendererService = inject(ObjectRendererService);
  private readonly meshRendererService = inject(MeshRendererService);
  private readonly areaRendererService = inject(AreaRendererService);
  private readonly areaEditRendererService = inject(AreaEditRendererService);

  private readonly rendererMap: Record<OVERLAY_TYPE, Renderer> = {
    [OVERLAY_TYPE.AREA]: this.areaRendererService,
    [OVERLAY_TYPE.AREA_EDIT]: this.areaEditRendererService,
    [OVERLAY_TYPE.MESH]: this.meshRendererService,
    [OVERLAY_TYPE.OBJECT]: this.objectRendererService,
    [OVERLAY_TYPE.OBJECT_EDIT]: this.objectEditRendererService,
  };

  public getRendererByOverlayType(overlayType: OVERLAY_TYPE): Renderer {
    return this.rendererMap[overlayType];
  }
}
