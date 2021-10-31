import { DrawingStatus } from '@models/DrawingContent';
import { InteractionService } from '@services/interaction-service/interaction.service';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const DEFAULT_LINE_THICKNESS = 5;
export class Pencil extends DrawingTool {
  constructor(selected: boolean, interactionService: InteractionService) {
    super(selected, interactionService);
    // this.updateColors();
    this.updateAttributes();
  }
  updateAttributes() {}

  down(position: Point) {
    this.currentPath = [];
    // console.log('here');
    super.down(position);

    this.ignoreNextUp = false;

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
    s += `\" stroke="#000000" fill="none" `;
    // Replace the number by the width chosen in the component
    s += `stroke-width="5" `;
    s += `transform="translate(0,0)"`;
    s += '/>\n';
    // console.log(s)
    return s;
  }
}
