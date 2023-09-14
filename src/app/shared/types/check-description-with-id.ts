export interface CheckDescription {
  title: string;
  modifier: number;
  dc: number;
}

export interface CheckDescriptionWithId extends CheckDescription {
  id: string;
}
