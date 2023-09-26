import { TravelMapMeshState } from '../../+state/travel-map-mesh.state';

export interface MeshRender {
  path: Path2D;
  center: { x: number; y: number };
}

export interface MeshAdapterStrategy {
  getMeshRender(meshId: string, meshState: TravelMapMeshState): MeshRender;
}
