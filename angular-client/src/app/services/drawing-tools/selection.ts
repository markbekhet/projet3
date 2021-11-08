import { Renderer2 } from '@angular/core';
import { ColorPickingService } from '../color-picker/color-picking.service';
import { InteractionService } from '../interaction/interaction.service';
import { DrawingTool } from './drawing-tool';
//import { DrawingContent, DrawingStatus } from "src/app/models/drawing-content";
import { Point } from './point';
//import { Canvas } from 'src/app/models/canvas';
//import { CanvasInteraction } from './canvas-interaction';

const INIT_VALUE = -1;

export class Selection extends DrawingTool {

  render!: Renderer2;
  selectedRef!: HTMLElement;

  initPosition!: Point;
  deltaX!: number;
  deltaY!: number;

  isPressed!: boolean;

  canvas!: HTMLElement;
  target!: SVGElement | null;
  itemUnderMouse!: number | null;
  canMoveSelection!: boolean;
  foundAnItem!: boolean;
  selectedItems: boolean[] = [];
  invertedItems: boolean[] = [];
  movingSelection!: boolean;
  movedSelectionOnce!: boolean;
  movedMouseOnce!: boolean;
  inverted!: boolean;
  wrapperDimensions: [Point, Point] = [new Point(INIT_VALUE, INIT_VALUE), new Point(INIT_VALUE, INIT_VALUE)];
  
  constructor(selected: boolean, 
    interactionService: InteractionService, 
    colorPick: ColorPickingService, 
    private drawing: HTMLElement,
    canvas: HTMLElement
    ) {
    super(selected, interactionService, colorPick);
    //this.selectedRef = drawing;
    this.canvas = canvas;

    window.addEventListener('newDrawing', (e: Event) => {
        for (let i = 0; i < this.drawing.childElementCount; i++) {
            const EL: Element = this.drawing.children[i];
            let status: string | null;

            try { // in case the getAttribute method is not implemented for the selected item
                status = EL.getAttribute('isListening');
            } catch (err) {
                status = null;
            }

            if (status !== 'true') {
                this.render.listen(EL, 'mousedown', () => {
                    this.render.setAttribute(EL, 'isListening', 'true');
                    if (!this.foundAnItem) {
                        let index = 0;
                        let currentChild = EL;
                        while ( currentChild != null ) {
                            currentChild = currentChild.previousSibling as Element;
                            index++;
                        }
                        this.itemUnderMouse = index - 1;
                        this.foundAnItem = true;
                    }
                });
            }
        }
    });
    // reset on tool change
    window.addEventListener('toolChange', (e: Event) => {
        console.log('tool changed');
        for (let i = 0; i < this.drawing.childElementCount; i++) {
            this.selectedItems = [];
        }
        this.selectedItems = [];
        this.invertedItems = [];
        this.itemUnderMouse = null;
        this.foundAnItem = false;
        this.cancel();
    });
  
  }

    updateAttributes(): void {
    
    }

    down(event: MouseEvent, position: Point) {
        /*if (this.drawing) {
            this.initPosition = position;
            this.target = event.target as SVGElement;
            this.deltaX = position.x - this.initPosition.x;
            this.deltaY = position.y - this.initPosition.y;
        }

        if (this.target && !this.drawing.contains(this.target)) {
            this.target = null;
            this.initPosition = {
                x: 0,
                y: 0
            };
        }*/
        
        if (this.target) {
            this.target.setAttribute('stroke', this.chosenColor.primColor);

            this.target = null;
            this.initPosition = {
                x: 0,
                y: 0
            };
        }

        if (event.target && this.drawing.contains(event.target as SVGElement)) {
            this.initPosition = position;
            this.target = event.target as SVGElement;

            this.deltaX = position.x - this.initPosition.x;
            this.deltaY = position.y - this.initPosition.y;

            this.isPressed = true;

            //draw box around
            //this.target.setAttribute('stroke', this.chosenColor.secColor);
            

            //how to set drawing status to "SELECTED"
        } 

    }


    up(event: MouseEvent, position: Point) {
        if(this.target) {
            switch(this.target.localName) {
                case 'polyline': this.savePolyline();
                    break;
                case 'rect': this.saveRect();
                    break;
                case 'ellipse': this.saveEllipse();
                    break;
            }
        }
        this.isPressed = false;
    }

    savePolyline() {
        if (this.target) {
            let points = (this.target as SVGPolylineElement).points;
            for (let i = 0; i < points.numberOfItems; i++) {
                points[i].x += this.deltaX;
                points[i].y += this.deltaY;
            }
            this.target.setAttribute('transform', '');
        }
    }

    saveRect() {
        if (this.target) {
            let rect = (this.target as SVGRectElement);
            rect.x.baseVal.value += this.deltaX;
            rect.y.baseVal.value += this.deltaY;
            this.target.setAttribute('transform', '');
        }
    }

    saveEllipse() {
        if (this.target) {
            let ellipse = (this.target as SVGEllipseElement);
            ellipse.cx.baseVal.value += this.deltaX;
            ellipse.cy.baseVal.value += this.deltaY;
            this.target.setAttribute('transform', '');
        }
    }

    createPath (path: Point[]) {
        
    }

    doubleClick() {

    }

    move(event: MouseEvent, position: Point) {
        /*if (this.target && this.drawing.contains(this.target)) {
            this.deltaX = position.x - this.initPosition.x;
            this.deltaY = position.y - this.initPosition.y;
            this.target.setAttribute('transform', `translate(${this.deltaX} ${this.deltaY})`);
        }
    */
        if (this.isPressed && this.target) {
            this.deltaX = position.x - this.initPosition.x;
            this.deltaY = position.y - this.initPosition.y;
            this.target.setAttribute('transform', `translate(${this.deltaX} ${this.deltaY})`);
        }
    }

    intersects(rect: DOMRect, position: Point):boolean {
        return position.x >= rect.x && position.x <= rect.x + rect.width && position.y >= rect.y && position.y <= rect.y + rect.height;
    }

    objectPressed(position: Point): boolean {
        return false;
    }



      
}
