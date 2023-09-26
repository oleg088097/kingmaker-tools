import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';

export const TravelMapDisplaySettingsActions = createActionGroup({
  source: 'Travel Map Display Settings',
  events: {
    updateDisplaySettings: props<{ displaySettings: TravelMapDisplaySettingsState }>(),
  },
});

export interface TravelMapDisplaySettingsState {
  isMeshElementTitleDisplayed: boolean;
  isFogDisplayed: boolean;
  scale: number;
}

interface TravelMapDisplaySettingsStateInternal extends TravelMapDisplaySettingsState {
  version: number;
}

const initialState: TravelMapDisplaySettingsStateInternal = {
  scale: 1,
  isFogDisplayed: true,
  isMeshElementTitleDisplayed: true,
  version: 1,
};

export const travelMapDisplaySettingsFeature = createFeature({
  name: 'TravelMapDisplaySettings',
  reducer: createReducer(
    initialState,
    on(
      TravelMapDisplaySettingsActions.updateDisplaySettings,
      (state, props): TravelMapDisplaySettingsStateInternal => {
        return {
          ...state,
          ...props.displaySettings,
        };
      },
    ),
  ),
});
