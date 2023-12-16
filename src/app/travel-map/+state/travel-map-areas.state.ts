import { createActionGroup, createFeature, createReducer, createSelector, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import { GlobalActions, UPDATE_ACTION_CREATOR } from '../../+state/global.actions';
import { type MapAreaEditState, type MapAreaState } from '../interfaces/map-area-state';
import { TravelMapActions } from './+module-state';
import { type VersionedState } from './versioned-state';

export const TravelMapAreasActions = createActionGroup({
  source: 'Travel Map Areas',
  events: {
    upsertArea: props<{ value: MapAreaState }>(),
    confirmDeleteArea: props<{ value: MapAreaState }>(),
    doDeleteArea: props<{ value: MapAreaState }>(),
    updateEditArea: props<{ value: MapAreaEditState | null }>(),
  },
});

export interface TravelMapAreasState {
  areas: Record<string, MapAreaState>;
  editArea: MapAreaEditState | null;
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
    on(TravelMapActions.fromSeed, (state, props): TravelMapAreasStateInternal => {
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
    on(TravelMapAreasActions.doDeleteArea, (state, props): TravelMapAreasStateInternal => {
      const areasClone = cloneDeep(state.areas);
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete areasClone[props.value.id];
      return {
        ...state,
        areas: areasClone,
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
  extraSelectors: ({ selectAreas }) => ({
    selectAreasByIds: (areaIds: string[]) =>
      createSelector(selectAreas, (areasMap) => areaIds.map((id) => areasMap[id])),
  }),
});
