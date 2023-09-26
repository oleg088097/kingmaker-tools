import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { CHECK_RESULT } from '../../shared/constants';
import { CheckDescriptionWithId } from '../../shared/types';

export type CheckDescriptionOptionalDc = Omit<CheckDescriptionWithId, 'dc'> & { dc?: number };

export interface CampingDataCheck extends CheckDescriptionOptionalDc {
  outcomes: {
    [key in CHECK_RESULT]: string;
  };
}

export interface CampingData {
  dc: number;
  version: number;
  checks: CampingDataCheck[];
}

export const CampingCalculationActions = createActionGroup({
  source: 'Camping Calculation',
  events: {
    fromSeed: props<{ data: CampingData }>(),
    updateCheck: props<{ value: CheckDescriptionOptionalDc }>(),
    updateCommonDc: props<{ value: number }>(),
  },
});

export interface CampingCalculationState {
  commonDc: number;
  checks: CheckDescriptionOptionalDc[];
}

interface CampingCalculationStateInternal extends CampingCalculationState {
  seedVersion: number;
  version: number;
}

const initialState: CampingCalculationStateInternal = {
  version: 1,
  seedVersion: 0,
  commonDc: 20,
  checks: [],
};

export const campingCalculationFeature = createFeature({
  name: 'campingCalculation',
  reducer: createReducer(
    initialState,
    on(CampingCalculationActions.updateCheck, (state, props): CampingCalculationStateInternal => {
      const index = state.checks.findIndex((check) => check.id === props.value.id);
      return {
        ...state,
        checks: [...state.checks.slice(0, index), props.value, ...state.checks.slice(index + 1)],
      };
    }),
    on(CampingCalculationActions.fromSeed, (state, props): CampingCalculationStateInternal => {
      if (state.seedVersion === props.data.version) {
        return state;
      }
      return {
        ...state,
        seedVersion: props.data.version,
        checks: props.data.checks.map((updatedCheck) => {
          const storedState = state.checks.find((storedCheck) => storedCheck.id === updatedCheck.id);
          return {
            id: updatedCheck.id,
            title: updatedCheck.title,
            dc: storedState?.dc ?? updatedCheck.dc,
            modifier: storedState?.modifier ?? updatedCheck.modifier,
          };
        }),
      };
    }),
    on(
      CampingCalculationActions.updateCommonDc,
      (state, props): CampingCalculationStateInternal => ({
        ...state,
        commonDc: props.value,
      }),
    ),
  ),
});
