import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { travelMapAreasFeature } from './+state/travel-map-area.state';
import { travelMapDisplaySettingsFeature } from './+state/travel-map-display-settings.state';
import { travelMapMeshFeature } from './+state/travel-map-mesh.state';
import { travelMapObjectsFeature } from './+state/travel-map-objects.state';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import { MapAreaOverlayComponent } from './map-area-overlay/map-area-overlay.component';
import { MapControlsOverlayComponent } from './map-controls-overlay/map-controls-overlay.component';
import { MapImageComponent } from './map-image/map-image.component';
import { MapMeshOverlayComponent } from './map-mesh-overlay/map-mesh-overlay.component';
import { AreaService } from './services/area.service';
import { MeshService } from './services/mesh.service';
import { TravelMapComponent } from './travel-map/travel-map.component';

@NgModule({
  declarations: [
    MapImageComponent,
    MapControlsOverlayComponent,
    TravelMapComponent,
    MapMeshOverlayComponent,
    MapAreaOverlayComponent,
    ContextMenuComponent,
  ],
  imports: [
    CommonModule,
    CdkMenuModule,
    RouterModule.forChild([
      {
        path: '',
        component: TravelMapComponent,
      },
    ]),
    MatButtonToggleModule,
    StoreModule.forFeature(travelMapMeshFeature),
    StoreModule.forFeature(travelMapObjectsFeature),
    StoreModule.forFeature(travelMapAreasFeature),
    StoreModule.forFeature(travelMapDisplaySettingsFeature),
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatListModule,
  ],
  providers: [MeshService, AreaService],
})
export class TravelMapModule {}
