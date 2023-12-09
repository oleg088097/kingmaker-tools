import { type Coordinates } from '../interfaces/coordinates';

export const pointerEventToCoords = (event: PointerEvent | MouseEvent): Coordinates => {
  return { x: event.offsetX, y: event.offsetY };
};
