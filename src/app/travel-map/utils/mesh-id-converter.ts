export class MeshIdConverter {
  public static convertCoordinatesToMeshId(y: number, x: number) {
    return `${String.fromCharCode(65 + y)}${x + 1}`;
  }

  public static convertMeshIdToCoordinates(meshId: string): {
    x: number;
    y: number;
  } {
    return {
      y: meshId.charCodeAt(0) - 65,
      x: parseInt(meshId.slice(1)) - 1,
    };
  }
}
