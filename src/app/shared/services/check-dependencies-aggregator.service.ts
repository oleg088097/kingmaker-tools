import { Injectable } from '@angular/core';
import { CheckDependencies } from '../types/check-dependencies';
import { CheckResult } from './check-performer.service';

export type AggregatedDependenciesOptions = {
  modifier: number;
  skipCheck: boolean;
  critSuccessRange: [number, number];
  critFailureRange: [number, number];
};

@Injectable({
  providedIn: 'root',
})
export class CheckDependenciesAggregatorService {
  public aggregateDependenciesOptions(
    checkDependencies: CheckDependencies | undefined,
    dependencyResult: Map<string, CheckResult> | undefined,
  ): AggregatedDependenciesOptions {
    if (!dependencyResult) {
      return {
        skipCheck: false,
        modifier: 0,
        critSuccessRange: [20, 20],
        critFailureRange: [20, 20],
      };
    }
    const dependenciesValues = Object.entries(checkDependencies ?? {})
      .map(([key, value]) => value[dependencyResult.get(key)?.checkResult ?? ''])
      .filter((value) => value !== undefined);
    const skipCheck = dependenciesValues.some((dependency) => dependency.skipCheck);
    const critSuccessRange = dependenciesValues.find((dependency) => dependency.critSuccessRange)
      ?.critSuccessRange ?? [20, 20];
    const critFailureRange = dependenciesValues.find((dependency) => dependency.critFailureRange)
      ?.critFailureRange ?? [20, 20];
    const modifier = dependenciesValues.reduce(
      (acc: number, currentValue) => acc + (currentValue.modifier ?? 0),
      0,
    );
    return {
      skipCheck,
      modifier,
      critSuccessRange,
      critFailureRange,
    };
  }
}
