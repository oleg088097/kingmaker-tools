import { CHECK_RESULT } from './check-result';

export enum CHECK_RESULT_COLOR {
  CRIT_SUCCESS = 'green',
  SUCCESS = 'greenyellow',
  FAIL = 'orange',
  CRIT_FAIL = 'red',
}

export interface CheckResultInterpretation {
  label: string;
  color: CHECK_RESULT_COLOR;
}

export const CHECK_RESULT_INTERPRETATION: { [key in CHECK_RESULT]: CheckResultInterpretation } = {
  [CHECK_RESULT.CRIT_SUCCESS]: {
    label: 'Крит. успех',
    color: CHECK_RESULT_COLOR.CRIT_SUCCESS,
  },
  [CHECK_RESULT.SUCCESS]: {
    label: 'Успех',
    color: CHECK_RESULT_COLOR.SUCCESS,
  },
  [CHECK_RESULT.FAIL]: {
    label: 'Провал',
    color: CHECK_RESULT_COLOR.FAIL,
  },
  [CHECK_RESULT.CRIT_FAIL]: {
    label: 'Крит. провал',
    color: CHECK_RESULT_COLOR.CRIT_FAIL,
  },
};
