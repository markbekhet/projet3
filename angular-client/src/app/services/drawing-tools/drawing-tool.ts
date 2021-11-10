/* eslint-disable @typescript-eslint/no-unused-vars */
import { Subscription } from 'rxjs';
import { ChosenColors } from '@models/ChosenColors';
import { DrawingContent, DrawingStatus } from '@models/DrawingMeta';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { InputObserver } from './input-observer';
import { Point } from './point';
import { ActiveDrawing/*, UserToken*/ } from '../static-services/user_token';
import { SocketService } from '../socket/socket.service';
import { DrawingService } from '../drawing/drawing.service';
import { AuthService } from '../authentication/auth.service';
import { User } from '@src/app/models/UserMeta';

const DEFAULT_PRIMARY_COLOR = 'FF0000FF';
const DEFAULT_SECONDARY_COLOR = '000000';
const DEFAULT_BACK_COLOR = 'FFFFFFFF';

export abstract class DrawingTool extends InputObserver {
  isDown: boolean;
  currentPath: Point[];
  // selected: boolean;
  ignoreNextUp: boolean;
  colorPick: ColorPickingService;
  chosenColor!: ChosenColors;
  colorSub!: Subscription;
  toolName!: string;
  userToken!: string;
  drawingId!: number;

  abstract createPath(
    path: Point[],
    doubleClickCheck?: boolean,
    removePerimeter?: boolean,
  ): void;
  static drawingContentID: number;

  constructor(
    selected: boolean,
    protected interactionService: InteractionService,
    colorPick: ColorPickingService,
    public readonly socketService: SocketService,
    public readonly drawingService: DrawingService,
    public readonly authService: AuthService,
  ) {
    super(selected);
    this.isDown = false;
    this.currentPath = [];
    this.ignoreNextUp = false;

    this.colorPick = colorPick;
    this.chosenColor = {
      primColor: DEFAULT_PRIMARY_COLOR,
      secColor: DEFAULT_SECONDARY_COLOR,
      backColor: DEFAULT_BACK_COLOR,
    };
    this.getUserToken();
    this.getDrawingId();
  }

  // Implement down() method to get the id?
  down(event: MouseEvent, position: Point) {
    // emit socket event to server to get the content id
    // this is a stub
    //DrawingTool.drawingContentID++;
    this.socketService.createDrawingContentRequest({drawingId: this.drawingId});
    // console.log(this.drawingContentID)
  }
  getUserToken(){
    this.authService.authentifiedUser.subscribe((user:User)=>{
      this.userToken = user.id;
      console.log(this,this.userToken);
    })
  }
  getDrawingId(){
    this.drawingService.drawingId.subscribe((id: number)=>{
      this.drawingId = id;
      console.log(this.drawingId);
    })
  }
  // To update the colors with the colors given by the draw view
  updateColors(): void {
    const DEFPRIM = '#000000ff';
    const DEFSEC = '#ff0000ff';
    const DEFBACK = '#ff0000ff';
    this.colorSub = this.colorPick.colorSubject.subscribe(
      (color: ChosenColors) => {
        if (color === undefined) {
          // eslint-disable-next-line no-param-reassign
          color = { primColor: DEFPRIM, secColor: DEFSEC, backColor: DEFBACK };
        }
        this.chosenColor = {
          primColor: color.primColor,
          secColor: color.secColor,
          backColor: color.backColor,
        };
      }
    );
    this.colorPick.emitColors();
  }

  abstract updateAttributes(): void;
  objectPressed(position: Point) {
    return false;
  }

  cancel() {
    this.currentPath = [];
    this.ignoreNextUp = true;
    this.isDown = false;
    // emit event with empty string
  }
  // called while the mouse is moving
  updateProgress(drawingStatus: DrawingStatus) {
    let d = '';
    d += this.createPath(this.currentPath);
    // emit event with the string d
    this.toolName = this.toolName;
    console.log(this.toolName);
    let drawingContent: DrawingContent = {userId: this.userToken, drawingId: ActiveDrawing.drawingId, id: DrawingTool.drawingContentID,
                  content: d, status: drawingStatus, toolName: this.toolName};
    this.socketService.sendDrawingToServer(drawingContent);
    /*this.interactionService.emitDrawingContent({
      id: this.drawingContentID,
      content: d,
      status: drawingStatus,
      userId: UserToken.userToken,
      drawingId: ActiveDrawing.drawingId,
      toolName: 'pencil',
      // TODO: 0 for drawingID here is just a placeholder to remove compile error
      // drawingID: 0,
    });*/
  }
  // I think we dont need this method
  updateDrawing(endIt?: boolean): string {
    let d = '';
    //d += this.createPath(this.currentPath, endIt, d);
    return d;
    // emit event with the string d and status === done (temp)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  goingOutsideCanvas(position: Point): void {
    // if currently affecting the canvas
    if (this.isDown) {
      // push to drawing and end stroke
      this.updateDrawing();
    }
  }

  goingInsideCanvas(event: MouseEvent, position: Point): void {
    // if currently affecting the canvas
    if (this.isDown) {
      // start new drawing
      this.down(event, position);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wheelMove(average: boolean, precise: boolean, clockwise: boolean): void {
    // Nothing happens for most of the tools
  }
}
