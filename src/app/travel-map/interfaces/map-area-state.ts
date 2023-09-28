export interface MapAreaState {
  id: string;
  title: string;
  comment: string;
  meshElementIds: string[];
  type: string;
  color: string;
  groups: unknown[];
  hidden: boolean;
  inEdit?: boolean;
}
