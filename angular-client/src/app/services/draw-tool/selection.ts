import { Renderer2 } from '@angular/core';
import { ColorPickingService } from '../color-picker/color-picking.service';
import { InteractionService } from '../interaction-service/interaction.service';
import { DrawingTool } from './drawing-tool';
import { Pencil } from './pencil';
import { Point } from './point';

const OUTLINE_COLOR = '0, 102, 204, 0.9';
const FILL_COLOR = '0, 102, 204, 0.3';
const INVERTED_OUTLINE_COLOR = '204, 0, 102, 0.9';
const INVERTED_FILL_COLOR = '204, 0, 102, 0.3';

const NO_MOUSE_MOVEMENT_TOLERANCE = 5;
const MIN_OFFSET_FOR_SELECTION = 10;

const LEFT_ARROW = 37;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const INIT_VALUE = -1;
const INIT_BOX_CENTER = 250;

export class Selection extends DrawingTool {

  render!: Renderer2;
  
  boxCenter: Point = new Point(INIT_BOX_CENTER, INIT_BOX_CENTER);
  initPosition!: Point;
  deltaX!: number;
  deltaY!: number;

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
  

  constructor(selected: boolean, interactionService: InteractionService, colorPick: ColorPickingService, private drawing: HTMLElement){
    super(selected, interactionService, colorPick);
    this.updateAttributes();
    this.updateColors();

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

    down(event: MouseEvent, position: Point) {
        if (this.drawing) {
            this.initPosition = position;
            this.target = event.target as SVGElement;
            this.deltaX = position.x - this.initPosition.x;
            this.deltaY = position.y - this.initPosition.y;
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
            this.target = null;
            this.initPosition = {
                x: 0,
                y: 0
            };
        }
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
            let rect = this.target as SVGRectElement;
            
        }
    }

    saveEllipse() {
        if (this.target) {
            this.target.setAttribute('transform', '');
        }
    }

    createPath (path: Point[]) {

    }

    doubleClick() {

    }

    updateAttributes(): void {
        
    }

    move(event: MouseEvent, position: Point) {
        if (this.target && this.drawing.contains(this.target)) {
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
