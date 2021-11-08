/* eslint-disable @typescript-eslint/no-unused-vars */
import { Subscription } from 'rxjs';
import { ChosenColors } from '@models/ChosenColors';
import { DrawingStatus } from '@models/DrawingMeta';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { InputObserver } from './input-observer';
import { Point } from './point';

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

  abstract createPath(
    path: Point[],
    doubleClickCheck?: boolean,
    removePerimeter?: boolean
  ): void;
  static drawingContentID: number = -1;

  constructor(
    selected: boolean,
    protected interactionService: InteractionService,
    colorPick: ColorPickingService
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
  }

  // Implement down() method to get the id?
  down(position: Point) {
    // emit socket event to server to get the content id
    // this is a stub
    DrawingTool.drawingContentID++;
    // console.log(this.drawingContentID)
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
    this.interactionService.emitDrawingContent({
      contentID: DrawingTool.drawingContentID,
      drawing: d,
      status: drawingStatus,
      // TODO: 0 for drawingID here is just a placeholder to remove compile error
      // drawingID: 0,
    });
  }
  // I think we dont need this method
  updateDrawing(endIt?: boolean): string {
    let d = '';
    d += this.createPath(this.currentPath, endIt);
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

  goingInsideCanvas(position: Point): void {
    // if currently affecting the canvas
    if (this.isDown) {
      // start new drawing
      this.down(position);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wheelMove(average: boolean, precise: boolean, clockwise: boolean): void {
    // Nothing happens for most of the tools
  }
}
