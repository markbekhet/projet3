import { DrawingStatus } from 'src/app/models/drawing-content';
//import { FormsAttribute } from '../attributes/attribute-form';
//import { ColorPickingService } from '../colorPicker/color-picking.service';
import { InteractionService } from '../interaction-service/interaction.service';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';

// Default attributes of shapes
const DEFAULT_PLOT_TYPE = 2;
const DEFAULT_NUMBER_CORNERS = 3;
const DEFAULT_LINE_THICKNESS = 5;

export class Shape extends DrawingTool {

    //attr: FormsAttribute;

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

    constructor(selected: boolean, interaction: InteractionService) {

        super(selected, interaction);
        //this.attr = { plotType: DEFAULT_PLOT_TYPE, lineThickness: DEFAULT_LINE_THICKNESS, numberOfCorners: DEFAULT_NUMBER_CORNERS };
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
    }

    updateAttributes(): void {
        /*this.interaction.$formsAttributes.subscribe((obj: FormsAttribute | undefined) => {
            if (obj) {
                // Getting attributes for a shape
                this.attr = { plotType: obj.plotType, lineThickness: obj.lineThickness, numberOfCorners: obj.numberOfCorners };
            }
        });*/
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
        // get fill and outline stroke attributes from renderMode (outline, fill, outline + fill)
        //this.stroke = (this.attr.plotType === 0 || this.attr.plotType === 2) ? `${this.chosenColor.secColor}` : 'none';
        //this.fill = (this.attr.plotType === 1 || this.attr.plotType === 2) ? `${this.chosenColor.primColor}` : 'none';

        this.stroke = 'black';
        this.fill = 'none';

        this.svgString += ` fill="${this.fill}"`;
        this.svgString += ` stroke-width="${DEFAULT_LINE_THICKNESS}" stroke="${this.stroke}"`;
        this.svgString += ` style="transform: translate(0px, 0px)"/>\n`;

    }

}
