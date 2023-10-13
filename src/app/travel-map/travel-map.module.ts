import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { NgxColorsModule } from 'ngx-colors';
import { travelMapAreasFeature } from './+state/travel-map-area.state';
import { travelMapDisplaySettingsFeature } from './+state/travel-map-display-settings.state';
import { travelMapImageFeature } from './+state/travel-map-image.state';
import { travelMapMeshFeature } from './+state/travel-map-mesh.state';
import { travelMapObjectsFeature } from './+state/travel-map-objects.state';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { AreaEditControlComponent } from './map-controls-overlay/area-edit-control/area-edit-control.component';
import { GlobalDisplayControlComponent } from './map-controls-overlay/global-display-control/global-display-control.component';
import { MapControlsOverlayComponent } from './map-controls-overlay/map-controls-overlay.component';
import { ScaleControlComponent } from './map-controls-overlay/scale-control/scale-control.component';
import { MapAreaEditingOverlayDirective } from './map-layers/map-area-editing-overlay/map-area-editing-overlay.component';
import { MapImageComponent } from './map-layers/map-image/map-image.component';
import { MapSimpleOverlayComponent } from './map-layers/map-simple-overlay/map-simple-overlay.component';
import { CanvasElementsGetterService } from './services/canvas-elements-getter.service';
import { CanvasManagerProviderService } from './services/canvas-manager-provider.service';
import { AreaEditorPluginService } from './services/editors/area-editor-plugin.service';
import { MapIconRegistryService } from './services/map-icon-registry.service';
import { RendererProviderService } from './services/renderer-provider.service';
import { AreaEditRendererService } from './services/renderers/area-edit-renderer.service';
import { AreaRendererService } from './services/renderers/area-renderer.service';
import { MeshRendererService } from './services/renderers/mesh-renderer.service';
import { ObjectRendererService } from './services/renderers/object-renderer.service';
import { TravelMapComponent } from './travel-map/travel-map.component';

@NgModule({
  declarations: [
    MapImageComponent,
    MapControlsOverlayComponent,
    TravelMapComponent,
    ContextMenuComponent,
    AreaEditControlComponent,
    GlobalDisplayControlComponent,
    ScaleControlComponent,
    MapSimpleOverlayComponent,
    MapAreaEditingOverlayDirective,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild([
      {
        path: '',
        component: TravelMapComponent,
      },
    ]),
    StoreModule.forFeature(travelMapImageFeature),
    StoreModule.forFeature(travelMapMeshFeature),
    StoreModule.forFeature(travelMapObjectsFeature),
    StoreModule.forFeature(travelMapAreasFeature),
    StoreModule.forFeature(travelMapDisplaySettingsFeature),
    CdkMenuModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatInputModule,
    NgxColorsModule,
  ],
  providers: [
    AreaEditorPluginService,
    MapIconRegistryService,
    MeshRendererService,
    AreaRendererService,
    AreaEditRendererService,
    ObjectRendererService,
    CanvasManagerProviderService,
    CanvasElementsGetterService,
    RendererProviderService,
  ],
})
export class TravelMapModule {}
