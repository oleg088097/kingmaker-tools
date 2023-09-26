import { TravelMapMeshState } from '../../+state/travel-map-mesh.state';
import { MeshIdConverter } from '../../utils/mesh-id-converter';
import { MeshAdapterStrategy, MeshRender } from './mesh-adapter-strategy';

export class HexMeshAdapterStrategy implements MeshAdapterStrategy {
  private angle60: number = (2 * Math.PI) / 6;
  private angle90: number = Math.PI / 2;

  public getMeshRender(meshId: string, meshState: TravelMapMeshState): MeshRender {
    const r = meshState.meshProperties.size;
    const coords = MeshIdConverter.convertMeshIdToCoordinates(meshId);

    const meshPath = new Path2D();
    const xShift = (coords.y % 2 ? -1 : 0) * r * Math.sin(this.angle60);
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
    //meshPath.closePath();
    return {
      path: meshPath,
      center: {
        x: offsetX,
        y: offsetY,
      },
    };
  }
}
