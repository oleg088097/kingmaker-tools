import {
  CampingChecksCalculationState,
  campingChecksCalculationFeature,
} from './camping-checks-calculation.state';
export interface CampingChecksCalculationModuleState {
  [campingChecksCalculationFeature.name]: CampingChecksCalculationState;
}
