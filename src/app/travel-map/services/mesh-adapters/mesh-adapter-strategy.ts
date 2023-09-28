import { type TravelMapMeshState } from '../../+state/travel-map-mesh.state';

export interface MeshTileRender {
  path: Path2D;
  center: { x: number; y: number };
}

export interface MeshAdapterStrategy {
  getMeshTileRender: (meshId: string, meshState: TravelMapMeshState) => MeshTileRender;
}
