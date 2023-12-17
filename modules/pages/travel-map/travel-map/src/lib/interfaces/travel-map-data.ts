import { type MapAreaState } from './map-area-state';
import { type MapObjectState } from './map-object-state';
import { type MeshElementState } from './mesh-element-state';

export enum MESH_TYPE {
  HEX = 'HEX',
  SQUARE = 'SQUARE',
}

export enum AXIS {
  X = 'X',
  Y = 'Y',
}
export enum ROW_TYPE {
  ODD = 'ODD',
  EVEN = 'EVEN',
}

export interface HexMapTypeData {
  shift: {
    axis: AXIS;
    shiftType: ROW_TYPE;
    truncateShifted: boolean;
  };
}

export interface MeshProperties {
  type: MESH_TYPE;
  size: number;
  meshLeftOffset: number;
  meshTopOffset: number;
  typeData: HexMapTypeData;
  dimensions: {
    x: number;
    y: number;
  };
}

export interface TravelMapData {
  version: number;
  image: {
    width: number;
    height: number;
    url: string;
  };
  mesh: {
    properties: MeshProperties;
    meshMap: Record<string, MeshElementState>;
  };
  objects: Record<string, MapObjectState>;
  areas: Record<string, MapAreaState>;
}
