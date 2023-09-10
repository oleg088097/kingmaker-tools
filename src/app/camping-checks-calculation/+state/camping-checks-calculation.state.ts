import { createActionGroup, createFeature, createReducer, on, props } from '@ngrx/store';
import { v4 as uuidv4 } from 'uuid';
import { SkillCheckFormValue } from '../camping-check-calculation/camping-check-calculation.component';

export const CampingChecksCalculationActions = createActionGroup({
  source: 'Camping Checks',
  events: {
    add: props<{ value: SkillCheckFormValue }>(),
    update: props<{ index: number; value: SkillCheckFormValue }>(),
    remove: props<{ index: number }>(),
  },
});

export interface CampingChecksCalculationState {
  checks: SkillCheckFormValue[];
}

const initialState: CampingChecksCalculationState = {
  checks: [
    {
      id: uuidv4(),
      title: 'Проверка',
      modifier: 0,
      dc: 20,
    },
  ],
};

export const campingChecksCalculationFeature = createFeature({
  name: 'campingChecks',
  reducer: createReducer(
    initialState,
    on(CampingChecksCalculationActions.add, (state, props) => ({
      ...state,
      checks: [...state.checks, props.value],
    })),
    on(CampingChecksCalculationActions.update, (state, props) => ({
      ...state,
      checks: [...state.checks.slice(0, props.index), props.value, ...state.checks.slice(props.index + 1)],
    })),
    on(CampingChecksCalculationActions.remove, (state, props) => ({
      ...state,
      checks: [...state.checks.slice(0, props.index), ...state.checks.slice(props.index + 1)],
    })),
  ),
});
