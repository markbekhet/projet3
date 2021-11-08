import { InputObserver } from '@services/drawing-tools/input-observer';
import { Point } from '@services/drawing-tools/point';

export class MouseHandler {
  mouseWindowPosition: Point;
  mouseCanvasPosition: Point;
  startedInsideWorkspace: boolean;
  insideWorkspace: boolean;
  svgCanvas: HTMLElement | null;
  // workingSpace: HTMLElement | null;
  svgBox: DOMRect | undefined;
  observers: InputObserver[];

  numberOfClicks: number;
  isFirstClick: boolean;
  upFromDoubleClick: boolean;

  constructor(svgCanvas: HTMLElement) {
    this.observers = [];

    this.svgCanvas = svgCanvas;

    this.updateWindowSize();

    this.mouseWindowPosition = new Point(0, 0);
    this.mouseCanvasPosition = this.windowToCanvas(this.mouseWindowPosition);
    this.startedInsideWorkspace = this.validPoint(this.mouseCanvasPosition);
    this.insideWorkspace = this.validPoint(this.mouseCanvasPosition);

    this.numberOfClicks = 0;
    this.isFirstClick = true;
    this.upFromDoubleClick = false;
  }

  updateWindowSize(): void {
    if (this.svgCanvas != null) {
      this.svgBox = this.svgCanvas.getBoundingClientRect();
    }
  }

  validPoint(mouseCanvasPosition: Point): boolean {
    if (this.svgBox !== undefined) {
      const VALID_X: boolean =
        mouseCanvasPosition.x + this.svgBox.left >= this.svgBox.left &&
        mouseCanvasPosition.x + this.svgBox.left <= this.svgBox.right;
      const VALID_Y: boolean =
        mouseCanvasPosition.y + this.svgBox.top >= this.svgBox.top &&
        mouseCanvasPosition.y + this.svgBox.top <= this.svgBox.bottom;

      return VALID_X && VALID_Y;
    }
    return false;
  }

  windowToCanvas(mouseWindowPosition: Point): Point {
    if (this.svgBox !== undefined) {
      const CANVAS_X: number = mouseWindowPosition.x - this.svgBox.left;
      const CANVAS_Y: number = mouseWindowPosition.y - this.svgBox.top;

      return new Point(CANVAS_X, CANVAS_Y);
    }
    return new Point(0, 0);
  }

  addObserver(newObserver: InputObserver): void {
    this.observers.push(newObserver);
  }

  updatePosition(x: number, y: number): void {
    this.mouseWindowPosition = new Point(x, y);
    this.mouseCanvasPosition = this.windowToCanvas(this.mouseWindowPosition);
  }

  down(e: MouseEvent): void {
    this.updatePosition(e.x, e.y);
    this.startedInsideWorkspace = this.validPoint(this.mouseCanvasPosition);
    this.insideWorkspace = this.validPoint(this.mouseCanvasPosition);

    if (this.startedInsideWorkspace) {
      this.callObserverDown(e.button === 2);
    }
  }

  up(e: MouseEvent): void {
    this.updatePosition(e.x, e.y);

    this.insideWorkspace = this.validPoint(this.mouseCanvasPosition);

    if (this.startedInsideWorkspace) {
      this.callObserverUp();
      this.startedInsideWorkspace = false;
    }

    this.numberOfClicks++;

    if (this.isFirstClick) {
      this.isFirstClick = false;
      const TIME_MS = 200;
      setTimeout(() => {
        if (this.numberOfClicks > 1) {
          this.callObserverDoubleClick();
        }
        this.numberOfClicks = 0;
        this.isFirstClick = true;
      }, TIME_MS);
    }
  }

  move(e: MouseEvent): void {
    this.updatePosition(e.x, e.y);

    const WAS_INSIDE: boolean = this.insideWorkspace;
    this.insideWorkspace = this.validPoint(this.mouseCanvasPosition);

    if (this.insideWorkspace) {
      if (WAS_INSIDE) {
        this.callObserverMove();
      } else {
        this.callObserverInsideCanvas();
      }
    } else if (WAS_INSIDE) {
      this.callObserverOutsideCanvas();
    }
  }

  wheel(e: WheelEvent): void {
    const AVERAGE = !e.shiftKey;
    const PRECISE = e.altKey;
    const CLOCK_WISE = e.deltaY >= 0;
    this.callObserverWheel(AVERAGE, PRECISE, CLOCK_WISE);
  }

  callObserverWheel(
    average: boolean,
    precise: boolean,
    clockwise: boolean
  ): void {
    this.observers.forEach((element: InputObserver) => {
      if (element.selected) {
        element.wheelMove(average, precise, clockwise);
      }
    });
  }

  callObserverMove(): void {
    // console.log("MOVING");
    this.observers.forEach((element: InputObserver) => {
      if (element.selected) {
        element.move(this.mouseCanvasPosition);
      }
    });
  }

  callObserverDown(isRightClick: boolean): void {
    // console.log("DOWN");
    this.observers.forEach((element: InputObserver) => {
      if (element.selected) {
        element.down(
          this.mouseCanvasPosition,
          this.insideWorkspace,
          isRightClick
        );
      }
    });
  }

  callObserverOutsideCanvas(): void {
    this.observers.forEach((element: InputObserver) => {
      if (element.selected) {
        element.goingOutsideCanvas(this.mouseCanvasPosition);
      }
    });
  }

  callObserverInsideCanvas(): void {
    // console.log("InsideCanvas");
    this.observers.forEach((element: InputObserver) => {
      if (element.selected) {
        element.goingInsideCanvas(this.mouseCanvasPosition);
      }
    });
  }

  callObserverUp(): void {
    // console.log("UP");
    this.observers.forEach((element: InputObserver) => {
      if (element.selected) {
        element.up(this.mouseCanvasPosition, this.insideWorkspace);
      }
    });
  }

  callObserverDoubleClick(): void {
    // console.log("DOUBLECLICK");
    this.observers.forEach((element: InputObserver) => {
      if (element.selected) {
        element.doubleClick(this.mouseCanvasPosition, this.insideWorkspace);
      }
    });
  }
}
