import { type TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { convertMeshIdToCoordinates } from '../../utils/mesh-id-converter';
import { type MeshAdapterStrategy, type MeshTileRender } from './mesh-adapter-strategy';

export class HexMeshAdapterStrategy implements MeshAdapterStrategy {
  private readonly angle60: number = (2 * Math.PI) / 6;
  private readonly angle90: number = Math.PI / 2;

  public getMeshTileRender(meshId: string, meshState: TravelMapMeshState): MeshTileRender {
    const r = meshState.meshProperties.size;
    const coords = convertMeshIdToCoordinates(meshId);

    const meshPath = new Path2D();
    const xShift = (coords.y % 2 === 1 ? -1 : 0) * r * Math.sin(this.angle60);
    const meshHexesOffsetX = r * 2 * Math.sin(this.angle60) * coords.x + xShift;
    const meshHexesOffsetY = (1 + Math.cos(this.angle60)) * r * coords.y;
    const offsetX =
      meshState.meshProperties.meshLeftOffset + 2 * r * Math.sin(this.angle60) + meshHexesOffsetX;
    const offsetY = meshState.meshProperties.meshTopOffset + r + meshHexesOffsetY;

    for (let i = 0; i < 6; i++) {
      const pointX = r * Math.cos(this.angle60 * i + this.angle90);
      const pointY = r * Math.sin(this.angle60 * i + this.angle90);
      meshPath.lineTo(offsetX + pointX, offsetY + pointY);
    }
    // meshPath.closePath();
    return {
      path: meshPath,
      center: {
        x: offsetX,
        y: offsetY,
      },
    };
  }
}
