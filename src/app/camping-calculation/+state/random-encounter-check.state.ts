import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { CheckDependencies } from '../../shared/types/check-dependencies';
import { CampingCalculationData } from '../interfaces/camping-calculation-data';

export const RandomEncounterCheckActions = createActionGroup({
  source: 'Random Encounter Check',
  events: {
    fromData: props<{ data: CampingCalculationData }>(),
    updateFlatDc: props<{ value: number }>(),
  },
});

export interface RandomEncounterCheckState {
  flatDc: number;
  campingChecksDependencies: CheckDependencies;
}

interface RandomEncounterCheckStateInternal extends RandomEncounterCheckState {
  dataVersion: number;
  version: number;
}

const initialState: RandomEncounterCheckStateInternal = {
  version: 1,
  dataVersion: 0,
  flatDc: 15,
  campingChecksDependencies: {},
};

export const randomEncounterCheckFeature = createFeature({
  name: 'randomEncounterCheck',
  reducer: createReducer(
    initialState,
    on(RandomEncounterCheckActions.fromData, (state, props): RandomEncounterCheckStateInternal => {
      if (state.dataVersion === props.data.version) {
        return state;
      }
      switch (props.data.version) {
        case 1:
        case 2: {
          return state;
        }
        case 3: {
          return {
            ...state,
            dataVersion: props.data.version,
            campingChecksDependencies: props.data.randomEncounterCheck.campingChecksDependencies,
          };
        }
      }
    }),
    on(
      RandomEncounterCheckActions.updateFlatDc,
      (state, props): RandomEncounterCheckStateInternal => ({
        ...state,
        flatDc: props.value,
      }),
    ),
  ),
});
