import { Renderer2 } from "@angular/core";
import { DrawingStatus } from "src/app/models/drawing-content";
import { InteractionService } from "../interaction-service/interaction.service";
import { DrawingTool } from "./drawing-tool";
import { Point } from "./point";

const DEFAULT_LINE_THICKNESS = 5;
export class Pencil extends DrawingTool{
    constructor(selected: boolean, interactionService: InteractionService){
        super(selected, interactionService);
        //this.updateColors();
        this.updateAttributes();
    }
    updateAttributes(){

    }

    down(position:Point){
        console.log('here');
        super.down(position);

        this.ignoreNextUp = false;

        // the pencil should affect the canvas
        this.isDown = true;
        // add the same point twice in case the mouse doesnt move
        this.currentPath.push(position);
        this.currentPath.push(position);

        // should be inside the listening event when integrated with socket
        this.updateProgress(DrawingStatus.InProgress);
    }

    up(position: Point, insideWorkspace: boolean){
        if (!this.ignoreNextUp) {
            // the pencil should not affect the canvas
            this.isDown = false;
      
            // no path is created while outside the canvas
            if (insideWorkspace) {
              // add everything to the canvas
              this.updateProgress(DrawingStatus.Done);
            }
        }
    }

    move(position: Point){
        if(this.isDown){
            this.currentPath.push(position);
            this.updateProgress(DrawingStatus.InProgress);
        }
    }

    doubleClick(Position: Point){

    }
    // this is the function used to write the string
    createPath(p:Point[]): string{
        let s= '';
        if(p.length < 2){
            return s;
        }
        s= `<polyline id= "${this.drawingContentId}" `;
        s+=  `points="`
        for(const point of p){
            s+= `${point.x} ${point.y},`;
        }
        s+=`\" stroke= "black" fill="none" />`;
        //console.log(s)
        return s;
    }
}