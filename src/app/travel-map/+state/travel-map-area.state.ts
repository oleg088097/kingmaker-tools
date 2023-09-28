import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { GlobalActions, UPDATE_ACTION_CREATOR } from '../../+state/global.actions';
import { type MapAreaState } from '../interfaces/map-area-state';
import { type TravelMapData } from '../interfaces/travel-map-data';
import { type VersionedState } from './versioned-state';

export const TravelMapAreasActions = createActionGroup({
  source: 'Travel Map Areas',
  events: {
    fromSeed: props<{ data: TravelMapData }>(),
    upsertArea: props<{ value: MapAreaState }>(),
    updateEditArea: props<{ value: Partial<MapAreaState> | null }>(),
  },
});

export interface TravelMapAreasState {
  areas: Record<string, MapAreaState>;
  editArea: Partial<MapAreaState> | null;
}

type TravelMapAreasStateInternal = TravelMapAreasState & VersionedState;

const initialState: TravelMapAreasStateInternal = {
  version: 1,
  seedVersion: 0,
  areas: {},
  editArea: null,
};

export const travelMapAreasFeature = createFeature({
  name: 'TravelMapAreas',
  reducer: createReducer(
    initialState,
    on(GlobalActions.loadStoreState, UPDATE_ACTION_CREATOR, (state): TravelMapAreasStateInternal => {
      // Drop edit on load state
      const areas = Object.fromEntries(
        Object.entries(state.areas).map(([key, value]) => [
          key,
          Object.assign(cloneDeep(value), { inEdit: false }),
        ]),
      );
      return {
        ...state,
        editArea: null,
        areas,
      };
    }),
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
    on(TravelMapAreasActions.updateEditArea, (state, props): TravelMapAreasStateInternal => {
      const areas =
        props.value?.id != null && state.areas[props.value.id] != null
          ? Object.assign(cloneDeep(state.areas), {
              [props.value.id]: { ...state.areas[props.value.id], inEdit: true },
            })
          : state.areas;
      return {
        ...state,
        areas,
        editArea: cloneDeep(props.value),
      };
    }),
  ),
});
