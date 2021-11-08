
import { Selection } from "./selection";

export class CanvasInteraction {
  static surroundSelectedShape(selectionTool: Selection) {
    const BOUNDING_BOX = selectionTool.canvas ? selectionTool.canvas.getBoundingClientRect() : null;
    const FILL = '0,120,215,0.3';
    const STROKE = '0,120,215,0.9';
    const STROKE_WIDTH = 1;
    if (BOUNDING_BOX) {
      let wrapper = CanvasInteraction.svgRectangle(
        'selection', 
        null, 
        BOUNDING_BOX.x, 
        BOUNDING_BOX.y,
        BOUNDING_BOX.width,
        BOUNDING_BOX.height,
        FILL,
        STROKE,
        STROKE_WIDTH,
        null);
      
        selectionTool.selectedRef.innerHTML = wrapper;
    }
    
  }

  static svgRectangle(
    id: string | null, className: string | null, startX: number, startY: number, width: number,
    height: number, fill: string, stroke: string, strokeWidth: number, dashArray: number | null): string {
    let rectangle = '';
    rectangle += '<rect ';
    if (id) {
      rectangle += `id="${id}"`;
    }
    if (className) {
      rectangle += `class="${className}"`;
    }
    rectangle += `x="${startX}" y="${startY}"`;
    rectangle += `width="${width}" height="${height}"`;
    rectangle += `fill="rgba(${fill})"`;
    rectangle += `stroke="rgba(${stroke})" stroke-width="${strokeWidth}"`;
    if (dashArray) {
      rectangle += `stroke-dasharray="${dashArray},${dashArray}"`;
    }
    rectangle += '/>';

    return rectangle;
  }
}
