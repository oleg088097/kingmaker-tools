import { type CampingChecksState, type campingChecksFeature } from './camping-checks.state';
import {
  type RandomEncounterCheckState,
  type randomEncounterCheckFeature,
} from './random-encounter-check.state';
import { type WatchChecksState, type watchChecksFeature } from './watch-checks.state';

export interface CampingCalculationModuleState {
  [campingChecksFeature.name]: CampingChecksState;
  [randomEncounterCheckFeature.name]: RandomEncounterCheckState;
  [watchChecksFeature.name]: WatchChecksState;
}
