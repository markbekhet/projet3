/*// import { DrawingStatus } from '@models/DrawingMeta';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
//import { DrawingContent, DrawingStatus } from '@src/app/models/DrawingMeta';
import { AuthService } from '../authentication/auth.service';
import { DrawingService } from '../drawing/drawing.service';
import { SocketService } from '../socket/socket.service';
//import { ActiveDrawing, UserToken } from '../static-services/user_token';
// import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { Shape } from './shape';
import { ELLIPSE_TOOL_NAME } from './tool-names';
import { ToolsAttributes } from './tools-attributes';

export class Ellipse extends Shape {
  objectPressed(position: Point): boolean {
    throw new Error('Method not implemented.');
  }
  toolName = ELLIPSE_TOOL_NAME;
  constructor(
    selected: boolean,
    interactionService: InteractionService,
    colorPick: ColorPickingService,
    socketService: SocketService,
    drawingService: DrawingService,
    authService: AuthService,
  ) {
    super(selected, interactionService, colorPick, socketService, drawingService, authService);
    this.updateColors();
    this.updateAttributes();
    this.getUserToken();
    this.getDrawingId();
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
    // Rectangle
  }

  // this is the function used to write the string
  createPath(p: Point[]): string {
    this.toolName = ELLIPSE_TOOL_NAME;
    this.svgString = '';

    this.setDimensions(p);
    this.svgString += `<ellipse cx="${this.startX + Math.abs(this.width / 2)}"`;
    this.svgString += ` cy="${this.startY + Math.abs(this.height / 2)}"`;
    this.svgString += ` rx="${Math.abs(this.width / 2)}"`;
    this.svgString += ` ry="${Math.abs(this.height / 2)}"`;

    this.setAttributesToPath();

    // end the divider
    // this.svgString += '/>';

    // can't have rectangle with 0 width or height
    if (this.width === 0 || this.height === 0) {
      // this.svgString = '';
    }
    //let data: DrawingContent ={id: this.drawingContentID, userId: this.userToken,
      // content: this.svgString, status: drawingStatus, drawingId: this.drawingId, toolName: this.toolName};
    //this.socketService.sendDrawingToServer(data);
    return this.svgString;
  }
}*/
