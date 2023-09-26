export interface MapObjectState {
  id: string;
  title: string;
  meshElementId: string;
  meshElementRelativeX: number;
  meshElementRelativeY: number;
  type: string;
  color: string | null;
  icon: string;
  groups: unknown[];
}
