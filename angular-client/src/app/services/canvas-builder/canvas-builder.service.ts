import { ElementRef, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Canvas } from '@models/CanvasInfo';

@Injectable({
  providedIn: 'root',
})
export class CanvasBuilderService {
  newCanvas: Canvas;
  canvSubject: Subject<Canvas>;

  constructor() {
    this.canvSubject = new Subject<Canvas>();
    this.newCanvas = {
      canvasWidth: this.getDefWidth(),
      canvasHeight: this.getDefHeight(),
      canvasColor: this.getDefColor(),
    };
  }

  getDefWidth(): number {
    const DIV = 1.18;
    return Math.round(window.innerWidth / DIV); // avoids pixel fractions
  }

  getDefHeight(): number {
    const DIV = 1.11; // adjusts after the top bar size
    return Math.round(window.innerHeight / DIV);
  }

  getDefColor(): string {
    const DEFCOLOR = 'ffffff';
    return DEFCOLOR;
  }

  setCanvasFromForm(
    widthInput: number,
    heightInput: number,
    colorInput: string
  ): void {
    console.log(widthInput, heightInput, colorInput);
    // eslint-disable-next-line no-param-reassign
    colorInput = `#${colorInput}`;
    this.newCanvas = {
      canvasWidth: widthInput,
      canvasHeight: heightInput,
      canvasColor: colorInput,
    }; // a fresh draw is always clean
  }

  getDefCanvas(): Canvas {
    return {
      canvasWidth: this.getDefWidth(),
      canvasHeight: this.getDefHeight(),
      canvasColor: this.getDefColor(),
    };
  }

  emitCanvas() {
    this.canvSubject.next(this.newCanvas);
  }

  wipeDraw(myDoodle: ElementRef | undefined) {
    if (myDoodle) {
      // eslint-disable-next-line no-param-reassign
      myDoodle.nativeElement.innerHTML = '';
    }
  }
}
