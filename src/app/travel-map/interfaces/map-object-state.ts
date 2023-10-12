export enum ICON_TYPE {
  building = 'building',
  creature = 'creature',
}

export interface MapObjectState {
  id: string;
  title: string;
  meshElementId: string;
  meshElementCenterRelativeX: number;
  meshElementCenterRelativeY: number;
  type: ICON_TYPE;
  color: string;
  icon: string;
  groups: unknown[];
  hidden: boolean;
  inEdit?: boolean;
}
