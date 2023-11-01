import { createActionGroup, props } from '@ngrx/store';
import { type TravelMapData } from '../interfaces/travel-map-data';
import { type TravelMapAreasState, type travelMapAreasFeature } from './travel-map-area.state';
import {
  type TravelMapDisplaySettingsState,
  type travelMapDisplaySettingsFeature,
} from './travel-map-display-settings.state';
import { type TravelMapImageState, type travelMapImageFeature } from './travel-map-image.state';
import { type TravelMapMeshState, type travelMapMeshFeature } from './travel-map-mesh.state';
import { type TravelMapObjectsState, type travelMapObjectsFeature } from './travel-map-objects.state';

export const TravelMapActions = createActionGroup({
  source: 'Travel Map',
  events: {
    fromSeed: props<{ data: TravelMapData }>(),
  },
});

export interface TravelMapModuleState {
  [travelMapImageFeature.name]: TravelMapImageState;
  [travelMapMeshFeature.name]: TravelMapMeshState;
  [travelMapObjectsFeature.name]: TravelMapObjectsState;
  [travelMapAreasFeature.name]: TravelMapAreasState;
  [travelMapDisplaySettingsFeature.name]: TravelMapDisplaySettingsState;
}
