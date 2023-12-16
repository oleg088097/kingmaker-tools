import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgxColorsModule } from 'ngx-colors';
import * as travelMapAreaEffects from './+state/travel-map-areas.effects';
import { travelMapAreasFeature } from './+state/travel-map-areas.state';
import { travelMapDisplaySettingsFeature } from './+state/travel-map-display-settings.state';
import { travelMapImageFeature } from './+state/travel-map-image.state';
import { travelMapMeshFeature } from './+state/travel-map-mesh.state';
import * as travelMapObjectEffects from './+state/travel-map-objects.effects';
import { travelMapObjectsFeature } from './+state/travel-map-objects.state';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { AreaEditControlComponent } from './map-controls-overlay/edit-control/area-edit-control/area-edit-control.component';
import { EditControlComponent } from './map-controls-overlay/edit-control/edit-control.component';
import { ObjectEditControlComponent } from './map-controls-overlay/edit-control/object-edit-control/object-edit-control.component';
import { GlobalDisplayControlComponent } from './map-controls-overlay/global-display-control/global-display-control.component';
import { MapControlsOverlayComponent } from './map-controls-overlay/map-controls-overlay.component';
import { ScaleControlComponent } from './map-controls-overlay/scale-control/scale-control.component';
import { MapAreaEditingOverlayDirective } from './map-layers/map-area-editing-overlay/map-area-editing-overlay.component';
import { MapImageComponent } from './map-layers/map-image/map-image.component';
import { MapObjectEditingOverlayDirective } from './map-layers/map-object-editing-overlay/map-object-editing-overlay.component';
import { MapSimpleOverlayComponent } from './map-layers/map-simple-overlay/map-simple-overlay.component';
import { CanvasElementsGetterService } from './services/canvas-elements-getter.service';
import { CanvasManagerProviderService } from './services/canvas-manager-provider.service';
import { AreaEditorPluginService } from './services/editors/area-editor-plugin.service';
import { ObjectEditorPluginService } from './services/editors/object-editor-plugin.service';
import { MapIconRegistryService } from './services/map-icon-registry.service';
import { MeshRelativeCoordsCalcService } from './services/mesh-relative-coords-calc.service';
import { ObjectCoordsCalculatorService } from './services/object-coords-calculator.service';
import { RendererProviderService } from './services/renderer-provider.service';
import { AreaEditRendererService } from './services/renderers/area-edit-renderer.service';
import { AreaRendererService } from './services/renderers/area-renderer.service';
import { MeshRendererService } from './services/renderers/mesh-renderer.service';
import { ObjectEditRendererService } from './services/renderers/object-edit-renderer.service';
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
    MapObjectEditingOverlayDirective,
    EditControlComponent,
    ObjectEditControlComponent,
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
    EffectsModule.forFeature(travelMapAreaEffects, travelMapObjectEffects),
    CdkMenuModule,
    MatBottomSheetModule,
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
    MatSelectModule,
    NgOptimizedImage,
  ],
  providers: [
    AreaEditorPluginService,
    ObjectEditorPluginService,
    MapIconRegistryService,
    MeshRendererService,
    AreaRendererService,
    AreaEditRendererService,
    ObjectRendererService,
    ObjectEditRendererService,
    CanvasManagerProviderService,
    CanvasElementsGetterService,
    RendererProviderService,
    MeshRelativeCoordsCalcService,
    ObjectCoordsCalculatorService,
  ],
})
export class TravelMapModule {}
