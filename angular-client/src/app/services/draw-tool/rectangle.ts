import { DrawingStatus } from "src/app/models/drawing-content";
import { ColorPickingService } from "../color-picker/color-picking.service";
import { InteractionService } from "../interaction-service/interaction.service";
import { DrawingTool } from "./drawing-tool";
import { Point } from "./point";
import { Shape } from "./shape";
import { ToolsAttributes } from "./tools-attributes";

const DEFAULT_LINE_THICKNESS = 5;
export class Rectangle extends Shape {
    
    constructor(selected: boolean, interactionService: InteractionService, colorPick: ColorPickingService){
        super(selected, interactionService, colorPick);
        this.updateColors();
        this.updateAttributes();
    }
    
    updateAttributes(){
        this.interactionService.$toolsAttributes.subscribe((attr: ToolsAttributes) => {
            if (attr) {
                this.attr = { 
                    shapeLineThickness: attr.shapeLineThickness,
                    shapeType: attr.shapeType
                };
            }
          });
    }

    setDimensions(p: Point[]): void {
        this.startX = this.width > 0 ? p[0].x : p[p.length - 1].x;
        this.startY = this.height > 0 ? p[0].y : p[p.length - 1].y;        
    
        super.setDimensions(p);
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