// import { Renderer2 } from '@angular/core';
import { DrawingStatus } from '@models/DrawingContent';
import { InteractionService } from '@services/interaction-service/interaction.service';
import { InputObserver } from './input-observer';
import { Point } from './point';

export abstract class DrawingTool extends InputObserver {
  isDown: boolean;
  currentPath: Point[];
  // selected: boolean;
  ignoreNextUp: boolean;
  drawingContentId: number;

  abstract createPath(
    path: Point[],
    doubleClickCheck?: boolean,
    removePerimeter?: boolean
  ): void;

  constructor(
    selected: boolean,
    private interactionService: InteractionService
  ) {
    super(selected);
    this.isDown = false;
    this.currentPath = [];
    this.ignoreNextUp = false;
    this.drawingContentId = -1;
  }

  // Implement down() method to get the id?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  down(position: Point) {
    // emit socket event to server to get the content id
    // this is a stub
    this.drawingContentId++;
    // console.log(this.drawingContentId)
  }

  // To update the colors with the colors given by the draw view
  updateColors() {}

  abstract updateAttributes(): void;

  cancel() {
    this.currentPath = [];
    this.ignoreNextUp = true;
    this.isDown = false;
    // emit event with empty string
  }

  // Called while the mouse is moving
  updateProgress(drawingStatus: DrawingStatus) {
    let d = '';
    d += this.createPath(this.currentPath);
    // emit event with the string d
    this.interactionService.emitDrawingContent({
      contentId: this.drawingContentId,
      drawing: d,
      status: drawingStatus,
      // TODO: 0 for drawingId here is just a placeholder to remove compile error
      // drawingId: 0,
    });
  }
  // I think we dont need this method
  updateDrawing(endIt?: boolean) {
    let d = '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
