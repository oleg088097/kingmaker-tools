import { CampingChecksState, campingChecksFeature } from './camping-checks.state';
import { RandomEncounterCheckState, randomEncounterCheckFeature } from './random-encounter-check.state';
import { WatchChecksState, watchChecksFeature } from './watch-checks.state';

export interface CampingCalculationModuleState {
  [campingChecksFeature.name]: CampingChecksState;
  [randomEncounterCheckFeature.name]: RandomEncounterCheckState;
  [watchChecksFeature.name]: WatchChecksState;
}
