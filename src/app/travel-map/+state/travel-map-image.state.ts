import { createFeature, createReducer, on } from '@ngrx/store';
import { TravelMapActions } from './+module-state';
import { type VersionedState } from './versioned-state';

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
    on(TravelMapActions.fromSeed, (state, props): TravelMapImageStateInternal => {
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
