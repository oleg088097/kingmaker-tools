import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { type CheckDependencies } from '../../shared/types/check-dependencies';
import {
  type CampingCalculationData,
  type CampingCalculationDataWatchCheck,
} from '../interfaces/camping-calculation-data';

export const WatchChecksActions = createActionGroup({
  source: 'Watch Checks',
  events: {
    fromData: props<{ data: CampingCalculationData }>(),
    updateChecks: props<{ checks: CampingCalculationDataWatchCheck[] }>(),
    updateCheck: props<{ value: CampingCalculationDataWatchCheck }>(),
    updateStealthModifier: props<{ value: number }>(),
  },
});

export interface WatchChecksState {
  stealthModifier: number;
  campingChecksDependencies: CheckDependencies;
  checks: CampingCalculationDataWatchCheck[];
}

interface WatchChecksStateInternal extends WatchChecksState {
  dataVersion: number;
  version: number;
}

const initialState: WatchChecksStateInternal = {
  version: 1,
  dataVersion: 0,
  stealthModifier: 0,
  campingChecksDependencies: {},
  checks: [],
};

export const watchChecksFeature = createFeature({
  name: 'watchChecks',
  reducer: createReducer(
    initialState,
    on(WatchChecksActions.updateCheck, (state, props): WatchChecksStateInternal => {
      const index = state.checks.findIndex((check) => check.id === props.value.id);
      return {
        ...state,
        checks: [...state.checks.slice(0, index), cloneDeep(props.value), ...state.checks.slice(index + 1)],
      };
    }),
    on(WatchChecksActions.updateChecks, (state, props): WatchChecksStateInternal => {
      return {
        ...state,
        checks: cloneDeep(props.checks),
      };
    }),
    on(WatchChecksActions.fromData, (state, props): WatchChecksStateInternal => {
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
            stealthModifier: props.data.watchChecks.stealthModifier,
            campingChecksDependencies: props.data.watchChecks.campingChecksDependencies,
            checks: props.data.watchChecks.checks.map((updatedCheck) => {
              const storedState = state.checks.find((storedCheck) => storedCheck.id === updatedCheck.id);
              return {
                id: updatedCheck.id,
                dependencies: updatedCheck.dependencies,
                title: updatedCheck.title,
                dc: storedState?.dc ?? updatedCheck.dc,
                modifier: storedState?.modifier ?? updatedCheck.modifier,
                disabled: storedState?.disabled ?? updatedCheck.disabled,
              };
            }),
          };
        }
      }
    }),
    on(
      WatchChecksActions.updateStealthModifier,
      (state, props): WatchChecksStateInternal => ({
        ...state,
        stealthModifier: props.value,
      }),
    ),
  ),
});
