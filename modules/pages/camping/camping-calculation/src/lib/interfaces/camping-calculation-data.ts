import { type CHECK_RESULT } from '../constants';
import { type CheckDependencies, type CheckDescriptionWithId } from '../types';

export type CheckDescriptionCamping = Omit<CheckDescriptionWithId, 'dc'> & {
  dc?: number;
  dependencies?: CheckDependencies;
};

export interface CampingCalculationDataCampingCheck extends CheckDescriptionCamping {
  outcomes: {
    [key in CHECK_RESULT]: string;
  };
}

export interface CampingCalculationDataWatchCheck extends CheckDescriptionCamping {
  disabled: boolean;
}

export interface CampingCalculationDataV3 {
  version: 3;
  campingChecks: {
    commonDc: number;
    checks: CampingCalculationDataCampingCheck[];
  };
  randomEncounterCheck: {
    flatDc: number;
    campingChecksDependencies: CheckDependencies;
  };
  watchChecks: {
    stealthModifier: number;
    campingChecksDependencies: CheckDependencies;
    checks: CampingCalculationDataWatchCheck[];
  };
}

// readonly legacy model
export interface CampingDataCheckV2 extends Omit<CheckDescriptionWithId, 'dc'> {
  dc?: number;
  dependencies?: CheckDependencies;
  outcomes: {
    [key in CHECK_RESULT]: string;
  };
}

// readonly legacy model
export interface CampingCalculationDataV2 {
  commonDc: number;
  version: 1 | 2;
  checks: CampingDataCheckV2[];
}

export type CampingCalculationData = CampingCalculationDataV2 | CampingCalculationDataV3;
