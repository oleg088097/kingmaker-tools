import { CampingCalculationState, campingCalculationFeature } from './camping-calculation.state';
export interface CampingCalculationModuleState {
  [campingCalculationFeature.name]: CampingCalculationState;
}
