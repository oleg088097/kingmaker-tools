import { type TravelMapMeshState } from '../../+state/travel-map-mesh.state';

export interface MeshTileRender {
  readonly path: Path2D;
  readonly center: { readonly x: number; readonly y: number };
}

export interface MeshAdapterStrategy {
  getMeshTileRender: (meshId: string, meshState: TravelMapMeshState) => MeshTileRender;
}
