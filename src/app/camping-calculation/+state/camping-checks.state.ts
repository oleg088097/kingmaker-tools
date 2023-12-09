import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import {
  type CampingCalculationData,
  type CheckDescriptionCamping,
} from '../interfaces/camping-calculation-data';

export const CampingChecksActions = createActionGroup({
  source: 'Camping Checks',
  events: {
    fromData: props<{ data: CampingCalculationData }>(),
    updateCheck: props<{ value: CheckDescriptionCamping }>(),
    updateCommonDc: props<{ value: number }>(),
  },
});

export interface CampingChecksState {
  commonDc: number;
  checks: CheckDescriptionCamping[];
}

interface CampingChecksStateInternal extends CampingChecksState {
  dataVersion: number;
  version: number;
}

const initialState: CampingChecksStateInternal = {
  version: 1,
  dataVersion: 0,
  commonDc: 20,
  checks: [],
};

export const campingChecksFeature = createFeature({
  name: 'campingChecks',
  reducer: createReducer(
    initialState,
    on(CampingChecksActions.updateCheck, (state, props): CampingChecksStateInternal => {
      const index = state.checks.findIndex((check) => check.id === props.value.id);
      return {
        ...state,
        checks: [...state.checks.slice(0, index), cloneDeep(props.value), ...state.checks.slice(index + 1)],
      };
    }),
    on(CampingChecksActions.fromData, (state, props): CampingChecksStateInternal => {
      if (state.dataVersion === props.data.version) {
        return state;
      }
      switch (props.data.version) {
        case 1:
        case 2: {
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
        }
        case 3: {
          return {
            ...state,
            dataVersion: props.data.version,
            checks: props.data.campingChecks.checks.map((updatedCheck) => {
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
        }
      }
    }),
    on(
      CampingChecksActions.updateCommonDc,
      (state, props): CampingChecksStateInternal => ({
        ...state,
        commonDc: props.value,
      }),
    ),
  ),
});
