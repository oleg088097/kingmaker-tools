import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { GlobalActions, UPDATE_ACTION_CREATOR } from '../../+state/global.actions';
import { type MapObjectEditState, type MapObjectState } from '../interfaces/map-object-state';
import { type TravelMapData } from '../interfaces/travel-map-data';
import { type VersionedState } from './versioned-state';

export const TravelMapObjectsActions = createActionGroup({
  source: 'Travel Map Objects',
  events: {
    fromSeed: props<{ data: TravelMapData }>(),
    upsertObject: props<{ value: MapObjectState }>(),
    updateEditObject: props<{ value: MapObjectEditState | null }>(),
  },
});

export interface TravelMapObjectsState {
  objects: Record<string, MapObjectState>;
  editObject: MapObjectEditState | null;
}

type TravelMapObjectsStateInternal = TravelMapObjectsState & VersionedState;

const initialState: TravelMapObjectsStateInternal = {
  version: 1,
  seedVersion: 0,
  objects: {},
  editObject: null,
};

export const travelMapObjectsFeature = createFeature({
  name: 'TravelMapObjects',
  reducer: createReducer(
    initialState,
    on(GlobalActions.loadStoreState, UPDATE_ACTION_CREATOR, (state): TravelMapObjectsStateInternal => {
      // Drop edit on load state
      const objects = Object.fromEntries(
        Object.entries(state.objects).map(([key, value]) => [
          key,
          Object.assign(cloneDeep(value), { inEdit: false }),
        ]),
      );
      return {
        ...state,
        editObject: null,
        objects,
      };
    }),
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
    on(TravelMapObjectsActions.updateEditObject, (state, props): TravelMapObjectsStateInternal => {
      const objects =
        props.value?.id != null && state.objects[props.value.id] != null
          ? Object.assign(cloneDeep(state.objects), {
              [props.value.id]: { ...state.objects[props.value.id], inEdit: true },
            })
          : state.objects;
      return {
        ...state,
        objects,
        editObject: cloneDeep(props.value),
      };
    }),
  ),
});
