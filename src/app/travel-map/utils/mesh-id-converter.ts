export const convertCoordinatesToMeshId = (y: number, x: number): string => {
  return `${String.fromCharCode(65 + y)}${x + 1}`;
};

export const convertMeshIdToCoordinates = (
  meshId: string,
): {
  x: number;
  y: number;
} => {
  return {
    y: meshId.charCodeAt(0) - 65,
    x: parseInt(meshId.slice(1)) - 1,
  };
};
