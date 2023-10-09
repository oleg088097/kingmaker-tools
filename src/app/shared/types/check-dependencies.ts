export type DependenciesOptions = {
  modifier?: number;
  skipCheck?: true;
  critSuccessRange?: [number, number];
  critFailureRange?: [number, number];
};

export type CheckDependencies = Record<string, Record<string, DependenciesOptions>>;
