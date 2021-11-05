import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { DrawingStatus } from '@models/DrawingMeta';
import { InteractionService } from '@services/interaction-service/interaction.service';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { ToolsAttributes } from './tools-attributes';

const DEF_LINE_THICKNESS = 5;

export class Pencil extends DrawingTool {
  attr: ToolsAttributes;

  constructor(
    selected: boolean,
    interactionService: InteractionService,
    colorPick: ColorPickingService
  ) {
    super(selected, interactionService, colorPick);
    this.attr = { pencilLineThickness: DEF_LINE_THICKNESS };
    this.updateAttributes();
    this.updateColors();
  }

  updateAttributes(): void {
    this.interactionService.$toolsAttributes.subscribe(
      (attr: ToolsAttributes) => {
        if (attr) {
          this.attr = { pencilLineThickness: attr.pencilLineThickness };
        }
      }
    );
  }

  down(position: Point) {
    this.currentPath = [];
    // console.log('here');
    super.down(position);

    // the pencil should affect the canvas
    this.isDown = true;
    // add the same point twice in case the mouse doesnt move
    this.currentPath.push(position);
    this.currentPath.push(position);

    // should be inside the listening event when integrated with socket
    this.updateProgress(DrawingStatus.InProgress);
  }

  up(position: Point, insideWorkspace: boolean) {
    if (!this.ignoreNextUp) {
      // the pencil should not affect the canvas
      this.isDown = false;

      // no path is created while outside the canvas
      if (insideWorkspace) {
        // add everything to the canvas
        this.updateProgress(DrawingStatus.Done);
      }
    }
  }

  move(position: Point) {
    if (this.isDown) {
      this.currentPath.push(position);
      this.updateProgress(DrawingStatus.InProgress);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doubleClick(Position: Point) {}

  // this is the function used to write the string
  createPath(p: Point[]): string {
    let s = '';
    if (p.length < 2) {
      return s;
    }
    s = `<polyline `;
    s += `points="`;
    for (let i = 0; i < p.length; i++) {
      s += `${p[i].x} ${p[i].y}`;
      if (i !== p.length - 1) {
        s += ',';
      }
    }
    // eslint-disable-next-line no-useless-escape
    s += `\" stroke="${this.chosenColor.primColor}" fill="none"`;
    // Replace the number by the width chosen in the component
    s += ` stroke-width="${this.attr.pencilLineThickness}"`;
    s += ` transform="translate(0,0)"`;
    s += '/>\n';
    // console.log(s)
    return s;
  }
}
