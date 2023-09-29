import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { CHECK_RESULT } from '../../shared/constants';
import { CheckDescriptionWithId } from '../../shared/types';

export type CheckDescriptionCamping = Omit<CheckDescriptionWithId, 'dc'> & {
  dc?: number;
  dependencies?: Record<string, Record<string, number | null>>;
};

export interface CampingDataCheck extends CheckDescriptionCamping {
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
    fromData: props<{ data: CampingData }>(),
    updateCheck: props<{ value: CheckDescriptionCamping }>(),
    updateCommonDc: props<{ value: number }>(),
  },
});

export interface CampingCalculationState {
  commonDc: number;
  checks: CheckDescriptionCamping[];
}

interface CampingCalculationStateInternal extends CampingCalculationState {
  dataVersion: number;
  version: number;
}

const initialState: CampingCalculationStateInternal = {
  version: 1,
  dataVersion: 0,
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
    on(CampingCalculationActions.fromData, (state, props): CampingCalculationStateInternal => {
      if (state.dataVersion === props.data.version) {
        return state;
      }
      return {
        ...state,
        dataVersion: props.data.version,
        checks: props.data.checks.map((updatedCheck) => {
          const storedState = state.checks.find((storedCheck) => storedCheck.id === updatedCheck.id);
          return {
            id: updatedCheck.id,
            dependencies: updatedCheck.dependencies,
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
