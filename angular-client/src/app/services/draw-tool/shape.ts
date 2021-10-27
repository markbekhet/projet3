import { DrawingStatus } from 'src/app/models/drawing-content';
//import { FormsAttribute } from '../attributes/attribute-form';
//import { ColorPickingService } from '../colorPicker/color-picking.service';
import { InteractionService } from '../interaction-service/interaction.service';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { ShapeTypes, ToolsAttributes } from './tools-attributes';

// Default attributes of shapes
const DEF_SHAPE_TYPE = ShapeTypes.OUTLINE;
const DEF_LINE_THICKNESS = 5;
const DEF_COLOR = '#000000';

export class Shape extends DrawingTool {

    attr: ToolsAttributes;

    // Shape's dimensions
    width: number;
    height: number;
    protected smallest: number;  // used for getting the smallest value between height and width

    // First point in x and y when first clicked
    protected startX: number;
    protected startY: number;

    // String for createPath
    svgString: string;

    // Attribute for createPath
    protected stroke: string;
    protected fill: string;
    protected primaryColor: string;
    protected secondaryColor: string;

    constructor(selected: boolean, interactionService: InteractionService) {

        super(selected, interactionService);
        this.attr = { 
            shapeLineThickness: DEF_LINE_THICKNESS, 
            shapeType: DEF_SHAPE_TYPE 
        };
        this.updateColors();
        this.updateAttributes();
        this.width = 0;
        this.height = 0;
        this.smallest = 0;
        this.startX = 0;
        this.startY = 0;
        this.svgString = '';
        this.stroke = '';
        this.fill = '';
        this.primaryColor = DEF_COLOR;
        this.secondaryColor = DEF_COLOR;
    }

    updateAttributes(): void {
        this.interactionService.$toolsAttributes.subscribe((attr: ToolsAttributes) => {
            if (attr) {
                this.attr = {
                    shapeLineThickness: attr.shapeLineThickness,
                    shapeType: attr.shapeType
                };
            }
          });
    }

    // updating on key up
    updateUp(keyCode: number): void {
        // nothing happens for global shape
    }

    // mouse down with shape in hand
    down(position: Point): void {
        super.down(position);
        // in case we changed tool while the mouse was down
        this.ignoreNextUp = false;

        // the shape should affect the canvas
        this.isDown = true;

        // add the same point twice in case the mouse doesnt move
        this.currentPath.push(position);
        this.currentPath.push(position);

        this.updateProgress(DrawingStatus.InProgress);
    }

    // mouse up with shape in hand
    up(position: Point): void {

        // in case we changed tool while the mouse was down
        if (!this.ignoreNextUp) {

            // the shape should not affect the canvas
            this.isDown = false;

            // add everything to the canvas
            this.updateDrawing(true);
            this.currentPath = [];
        }
    }

    // mouse move with shape in hand
    move(position: Point): void {

        // only if the shapeTool is currently affecting the canvas
        if (this.isDown) {

            // save mouse position
            this.currentPath.push(position);

            this.updateProgress(DrawingStatus.InProgress);
        }
    }

    // mouse doubleClick with rectangle in hand
    doubleClick(position: Point): void {
        // since its down -> up -> down -> up -> doubleClick, nothing more happens for the rectangle
    }

    // when we go from inside to outside the canvas
    goingOutsideCanvas(): void {
        // nothing happens since we might want to readjust the shape once back in
    }

    // when we go from outside to inside the canvas
    goingInsideCanvas(): void {
        // nothing happens since we just update the preview
    }

    setDimensions(p: Point[]): void {
        // first and last points
        const P1X = p[0].x;
        const P1Y = p[0].y;
        const P2X = p[p.length - 1].x;
        const P2Y = p[p.length - 1].y;

        // calculate the width and height of the rectangle
        this.width = P2X - P1X;
        this.height = P2Y - P1Y;
    }

    // Creates an svg shape
    createPath(p: Point[], removePerimeter?: boolean): void {
        // Shape is only virtual, so we do not create a path
    }

    setAttributesToPath(): void {
        this.primaryColor = '#000000';
        this.secondaryColor = '#afafaf';

        switch(this.attr.shapeType) {
            case 'OUTLINE': {
                this.stroke = this.primaryColor;
                this.fill = 'none';
            }
                break;
            case 'FULL': {
                console.log('we get in here');
                this.stroke = 'none';
                this.fill = this.secondaryColor;
            }
                break;
            case 'BOTH': {
                this.stroke = this.primaryColor;
                this.fill = this.secondaryColor;
            }
                break; 
        }

        this.svgString += ` fill="${this.fill}"`;
        this.svgString += ` stroke-width="${this.attr.shapeLineThickness}" stroke="${this.stroke}"`;
        this.svgString += ` style="transform: translate(0px, 0px)"/>\n`;

    }

}
