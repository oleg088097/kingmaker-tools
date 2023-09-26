import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { MapAreaState } from '../interfaces/map-area-state';
import { TravelMapData } from '../interfaces/travel-map-data';
import { VersionedState } from './versioned-state';

export const TravelMapAreasActions = createActionGroup({
  source: 'Travel Map Areas',
  events: {
    fromSeed: props<{ data: TravelMapData }>(),
    upsertArea: props<{ value: MapAreaState }>(),
  },
});

export interface TravelMapAreasState {
  areas: Record<string, MapAreaState>;
}

type TravelMapAreasStateInternal = TravelMapAreasState & VersionedState;

const initialState: TravelMapAreasStateInternal = {
  version: 1,
  seedVersion: 0,
  areas: {},
};

export const travelMapAreasFeature = createFeature({
  name: 'TravelMapAreas',
  reducer: createReducer(
    initialState,
    on(TravelMapAreasActions.fromSeed, (state, props): TravelMapAreasStateInternal => {
      if (state.seedVersion === props.data.version) {
        return state;
      }
      return {
        ...state,
        seedVersion: props.data.version,
        areas: Object.assign({}, props.data.areas, cloneDeep(state.areas)),
      };
    }),
    on(TravelMapAreasActions.upsertArea, (state, props): TravelMapAreasStateInternal => {
      return {
        ...state,
        areas: Object.assign(cloneDeep(state.areas), { [props.value.id]: props.value }),
      };
    }),
  ),
});
