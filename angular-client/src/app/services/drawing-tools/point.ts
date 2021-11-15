export class Point{
    x: number;
    y: number;
    constructor(x: number, y:number){
        this.x = x;
        this.y =y;
    }

    equals(point: Point): Boolean{
        return this.x == point.x && this.y == point.y;
    }
    
    difference(point:Point): Point{
        return new Point(point.x - this.x, point.y - this.y)
    }

    makeEqualTo(point: Point){
        this.x = point.x
        this.y = point.y
    }

    plus(point: Point){
        this.x += point.x
        this.y += point.y
    }
    static rpositionMouse(e: MouseEvent, canvas: HTMLElement){
        let clientRect = canvas.getBoundingClientRect()
        let x = e.x - clientRect.left;
        let y = e.y - clientRect.top;
        return new Point(x,y);
    }
}