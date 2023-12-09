export interface MapAreaEditState {
  id?: string;
  title: string;
  comment?: string;
  meshElementIds: string[];
  type: string;
  color: string;
  groups?: unknown[];
}

export interface MapAreaState extends Required<MapAreaEditState> {
  inEdit?: boolean;
}
