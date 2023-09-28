import { type CampingCalculationState, type campingCalculationFeature } from './camping-calculation.state';
export interface CampingCalculationModuleState {
  [campingCalculationFeature.name]: CampingCalculationState;
}
