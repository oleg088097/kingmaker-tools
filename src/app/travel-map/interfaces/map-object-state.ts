export enum ICON_TYPE {
  building = 'building',
  creature = 'creature',
  default = 'default',
}

export interface MapObjectEditState {
  id?: string;
  title?: string;
  meshElementId: string;
  meshElementCenterRelativeX: number;
  meshElementCenterRelativeY: number;
  type: ICON_TYPE;
  color: string;
  icon: string;
  groups?: unknown[];
}

export interface MapObjectState extends Required<MapObjectEditState> {
  hidden: boolean;
  inEdit?: boolean;
}
