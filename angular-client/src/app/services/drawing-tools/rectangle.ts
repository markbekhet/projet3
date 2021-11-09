// import { DrawingStatus } from '@models/DrawingMeta';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { DrawingContent, DrawingStatus } from '@src/app/models/DrawingMeta';
import { SocketService } from '../socket/socket.service';
import { ActiveDrawing, UserToken } from '../static-services/user_token';
// import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { Shape } from './shape';
import { ToolsAttributes } from './tools-attributes';

export class Rectangle extends Shape {
  objectPressed(position: Point): boolean {
    throw new Error('Method not implemented.');
  }
  toolName = 'rect';
  constructor(
    selected: boolean,
    interactionService: InteractionService,
    colorPick: ColorPickingService,
    socketService: SocketService
  ) {
    super(selected, interactionService, colorPick, socketService);
    this.updateColors();
    this.updateAttributes();
  }

  updateAttributes() {
    this.interactionService.$toolsAttributes.subscribe(
      (attr: ToolsAttributes) => {
        if (attr) {
          this.attr = {
            shapeLineThickness: attr.shapeLineThickness,
            shapeType: attr.shapeType,
          };
        }
      }
    );
  }

  setDimensions(p: Point[]): void {
    this.startX = this.width > 0 ? p[0].x : p[p.length - 1].x;
    this.startY = this.height > 0 ? p[0].y : p[p.length - 1].y;

    super.setDimensions(p);
  }

  // this is the function used to write the string
  createPath(p: Point[], drawingStatus: DrawingStatus): string {
    this.svgString = '';

    this.setDimensions(p);
    this.svgString += `<rect x="${this.startX}" y="${this.startY}" `;
    this.svgString += `width="${Math.abs(this.width)}" height="${Math.abs(
      this.height
    )}"`;

    this.setAttributesToPath();

    // end the divider
    // this.svgString += '/>';

    // can't have rectangle with 0 width or height
    if (this.width === 0 || this.height === 0) {
      // this.svgString = '';
    }
    let data: DrawingContent =  {id: this.drawingContentID, userId: UserToken.userToken,
      content: this.svgString, status: drawingStatus, drawingId: ActiveDrawing.drawingId, toolName: this.toolName};
    this.socketService.sendDrawingToServer(data);
    return this.svgString;
  }
}
