import { Point } from "./point";

export abstract class InputObserver {
    constructor(selected:boolean){
        this.selected = selected;
    }

    selected: boolean;

    // Mouse events
    abstract wheelMove(average: boolean, precise: boolean, clockwise: boolean): void;
    abstract down(position: Point, insideWorkspace?: boolean, isRightClick?: boolean): void;
    abstract up(position: Point, insideWorkspace?: boolean): void;
    abstract move(position: Point): void;
    abstract doubleClick(position: Point, insideWorkspace?: boolean): void;
    abstract goingOutsideCanvas(position: Point): void;
    abstract goingInsideCanvas(position: Point): void;
    abstract objectPressed(position: Point): boolean;
}