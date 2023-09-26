import { TravelMapAreasState, travelMapAreasFeature } from './travel-map-area.state';
import {
  TravelMapDisplaySettingsState,
  travelMapDisplaySettingsFeature,
} from './travel-map-display-settings.state';
import { TravelMapMeshState, travelMapMeshFeature } from './travel-map-mesh.state';
import { TravelMapObjectsState, travelMapObjectsFeature } from './travel-map-objects.state';

export interface TravelMapModuleState {
  [travelMapMeshFeature.name]: TravelMapMeshState;
  [travelMapObjectsFeature.name]: TravelMapObjectsState;
  [travelMapAreasFeature.name]: TravelMapAreasState;
  [travelMapDisplaySettingsFeature.name]: TravelMapDisplaySettingsState;
}
