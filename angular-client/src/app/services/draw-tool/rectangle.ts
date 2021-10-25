import { DrawingStatus } from "src/app/models/drawing-content";
import { InteractionService } from "../interaction-service/interaction.service";
import { DrawingTool } from "./drawing-tool";
import { Point } from "./point";
import { Shape } from "./shape";

const DEFAULT_LINE_THICKNESS = 5;
export class Rectangle extends Shape {
    
    constructor(selected: boolean, interactionService: InteractionService){
        super(selected, interactionService);
        //this.updateColors();
        this.updateAttributes();
    }
    updateAttributes(){
        
    }

    setDimensions(p: Point[]): void {
        this.startX = this.width > 0 ? p[0].x : p[p.length - 1].x;
        this.startY = this.height > 0 ? p[0].y : p[p.length - 1].y;        
    
        super.setDimensions(p);
        // Rectangle
    }

    // this is the function used to write the string
    createPath(p:Point[]): string{
        this.svgString = '';

        this.setDimensions(p);
        this.svgString += `<rect x="${this.startX}" y="${this.startY}" `;
        this.svgString += `width="${Math.abs(this.width)}" height="${Math.abs(this.height)}"`;

        this.setAttributesToPath();

        // end the divider
        //this.svgString += '/>';

        // can't have rectangle with 0 width or height
        if (this.width === 0 || this.height === 0) {
            //this.svgString = '';
        }

        return this.svgString;
    }
}