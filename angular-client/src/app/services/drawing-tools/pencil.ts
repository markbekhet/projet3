import { DrawingContent, DrawingStatus } from '@models/DrawingMeta';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '../socket/socket.service';
import { ActiveDrawing, UserToken } from '../static-services/user_token';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { ToolsAttributes } from './tools-attributes';

const DEF_LINE_THICKNESS = 5;

export class Pencil extends DrawingTool {
  attr: ToolsAttributes;
  minPoint: Point = {
    x: 0,
    y: 0
  };
  maxPoint: Point = this.minPoint;
  toolName = 'pencil';
  constructor(
    selected: boolean,
    interactionService: InteractionService,
    colorPick: ColorPickingService,
    socketService: SocketService
  ) {
    super(selected, interactionService, colorPick, socketService);
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

  down(event: MouseEvent, position: Point) {
    this.currentPath = [];
    // console.log('here');
    super.down(event, position);

    // the pencil should affect the canvas
    this.isDown = true;
    // add the same point twice in case the mouse doesnt move
    this.currentPath.push(position);
    this.currentPath.push(position);
    this.socketService.getDrawingContentId().subscribe((data:{contentId: number})=>{
      this.drawingContentID = data.contentId;
      this.updateProgress(DrawingStatus.InProgress);
    })
    // should be inside the listening event when integrated with socket
  }

  up(event: MouseEvent, position: Point, insideWorkspace: boolean) {
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

  move(event: MouseEvent, position: Point) {
    if (this.isDown) {
      this.currentPath.push(position);
      this.updateProgress(DrawingStatus.InProgress);
      this.updateMinMaxPoints(position);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doubleClick(Position: Point) {}

  // this is the function used to write the string
  createPath(p: Point[], drawingStatus: DrawingStatus): string {
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
    console.log(ActiveDrawing.drawingId);
    let data: DrawingContent = {id: this.drawingContentID, userId: UserToken.userToken,
       content: s, status: drawingStatus, drawingId: ActiveDrawing.drawingId, toolName: this.toolName};
    this.socketService.sendDrawingToServer(data);
    return s;
  }

  updateMinMaxPoints(position: Point) {
    //x 
    if (position.x > this.maxPoint.x) {
        this.maxPoint.x = position.x;
    } else if (position.x < this.minPoint.x) {
        this.minPoint.x = position.x;
    }
    //y
    if (position.y > this.maxPoint.y) {
        this.maxPoint.y = position.y;
    } else if (position.y < this.minPoint.y) {
        this.minPoint.y = position.y;
    }
}

objectPressed(position: Point): boolean {
  /*let inXAxes = (position.x >= minPoint.x + totalTranslation.x)
      && (eventX <= maxPoint.x + totalTranslation.x)
  let inYaxes = (eventY >= minPoint.y + totalTranslation.y)
      && (eventY <= maxPoint.y + totalTranslation.y)
  return inXAxes && inYaxes*/

  const xAxis: boolean = (position.x > this.minPoint.x) && (position.x < this.maxPoint.x);
  const yAxis: boolean = (position.y > this.minPoint.y) && (position.y < this.maxPoint.y);
  return xAxis && yAxis;

}
}
