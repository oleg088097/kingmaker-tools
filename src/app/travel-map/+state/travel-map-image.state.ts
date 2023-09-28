import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { type TravelMapData } from '../interfaces/travel-map-data';
import { type VersionedState } from './versioned-state';

export const TravelMapImageActions = createActionGroup({
  source: 'Travel Map Image',
  events: {
    fromSeed: props<{ data: TravelMapData }>(),
  },
});

export interface TravelMapImageState {
  image: {
    width: number;
    height: number;
    url: string;
  };
}

type TravelMapImageStateInternal = TravelMapImageState & VersionedState;

const initialState: TravelMapImageStateInternal = {
  version: 1,
  seedVersion: 0,
  image: {
    width: 0,
    height: 0,
    url: '',
  },
};

export const travelMapImageFeature = createFeature({
  name: 'TravelMapImage',
  reducer: createReducer(
    initialState,
    on(TravelMapImageActions.fromSeed, (state, props): TravelMapImageStateInternal => {
      if (state.seedVersion === props.data.version) {
        return state;
      }
      return {
        ...state,
        seedVersion: props.data.version,
        image: Object.assign({}, props.data.image),
      };
    }),
  ),
});
