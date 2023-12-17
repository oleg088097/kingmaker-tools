export interface Renderer {
  render: (ctx: CanvasRenderingContext2D) => void;
  getCoordsElements: (x: number, y: number, ctx: CanvasRenderingContext2D) => string[];
}
