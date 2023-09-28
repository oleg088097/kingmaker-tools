import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { type MapObjectState } from '../interfaces/map-object-state';
import { type TravelMapData } from '../interfaces/travel-map-data';
import { type VersionedState } from './versioned-state';

export const TravelMapObjectsActions = createActionGroup({
  source: 'Travel Map Objects',
  events: {
    fromSeed: props<{ data: TravelMapData }>(),
    upsertObject: props<{ value: MapObjectState }>(),
  },
});

export interface TravelMapObjectsState {
  objects: Record<string, MapObjectState>;
}

type TravelMapObjectsStateInternal = TravelMapObjectsState & VersionedState;

const initialState: TravelMapObjectsStateInternal = {
  version: 1,
  seedVersion: 0,
  objects: {},
};

export const travelMapObjectsFeature = createFeature({
  name: 'TravelMapObjects',
  reducer: createReducer(
    initialState,
    on(TravelMapObjectsActions.fromSeed, (state, props): TravelMapObjectsStateInternal => {
      if (state.seedVersion === props.data.version) {
        return state;
      }
      return {
        ...state,
        seedVersion: props.data.version,
        objects: Object.assign({}, props.data.objects, cloneDeep(state.objects)),
      };
    }),
    on(TravelMapObjectsActions.upsertObject, (state, props): TravelMapObjectsStateInternal => {
      return {
        ...state,
        objects: Object.assign(cloneDeep(state.objects), { [props.value.id]: props.value }),
      };
    }),
  ),
});
