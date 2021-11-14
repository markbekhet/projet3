import { ElementRef, Renderer2 } from '@angular/core';
import {  DrawingContent, DrawingStatus } from '@models/DrawingMeta';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { ChosenColors } from '@src/app/models/ChosenColors';
import { SocketService } from '../socket/socket.service';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { PENCIL_TOOL_NAME } from './tool-names';
import { ToolsAttributes } from './tools-attributes';

const DEF_LINE_THICKNESS = 5;
const RADUIS = 10;
const STROKE_WIDTH_REGEX = new RegExp(`stroke-width="([0-9]+)"`);
const STROKE_REGEX = new RegExp(`stroke="([#a-zA-Z0-9]+)"`);

const POINTS_REGEX = new RegExp(
  `points="([-?0-9.?]*( )*[-?0-9.?]*(,[-?0-9.?]*( )*[-?0-9.?]*)*)"`
);
const TRANSLATE_REGEX = new RegExp(
  /translate\((-?\d+(?:\.\d*)?),(-?\d+(?:\.\d*)?)\)/
)

const DEFPRIM = '#000000ff';

export class Pencil implements DrawingTool {
  attr!: ToolsAttributes;
  minPoint: Point = new Point(
    Number.MAX_VALUE,
    Number.MAX_VALUE
  );
  maxPoint: Point = new Point(0,0);
  toolName = PENCIL_TOOL_NAME;
  currentX: number = 0;
  currentY: number = 0;
  str: string = "<polyline ";
  selected: boolean = false;
  startTransformPoint: Point;
  totalTranslation: Point = new Point(0,0);
  totalScaling: Point = new Point(0,0);
  scalingPositions: Map<Point, Point> = new Map<Point, Point>();
  contentId!: number;
  userId: string;
  element!: SVGPolylineElement;
  primaryColor! :string;
  drawingId!: number;
  pointsArray: Point[];

  constructor(
    private interactionService: InteractionService,
    private colorPick: ColorPickingService,
    private socketService: SocketService,
    userId: string,
    private rendrer: Renderer2,
    private canvas:ElementRef
  ) {
    this.startTransformPoint = new Point(0,0)
    this.pointsArray = []
    this.element = this.rendrer.createElement("polyline", "svg") as SVGPolylineElement;
    this.attr = {pencilLineThickness:DEF_LINE_THICKNESS};
    //this.updateThickness();
    //this.updatePrimaryColor();
    this.userId = userId;
    this.primaryColor = DEFPRIM;
  }
  onMouseDown(event: MouseEvent): void {
    this.pointsArray.push(Point.rpositionMouse(event, this.canvas.nativeElement));
    this.rendrer.setAttribute(this.element,"points", this.pointsToString())
    this.rendrer.setAttribute(this.element, "transform", "translate(0,0)")
    this.rendrer.setAttribute(this.element, "stroke-width", `${this.attr.pencilLineThickness}`);
    this.rendrer.setAttribute(this.element, "stroke", `${this.primaryColor}`)
    this.requestCreation();

  }

  onMouseUp(e: MouseEvent): void {
    this.pointsArray.forEach((point)=>{
      point.x += this.totalTranslation.x;
      point.y += this.totalTranslation.y
    })
    this.rendrer.setAttribute(this.element,'points', this.pointsToString())
    this.totalTranslation = new Point(0,0);
    this.rendrer.setAttribute(this.element, "transform", "translate(0,0)"); 
    this.setCriticalValues()
    this.calculateScalingPositions()
    this.select()
  }

  onMouseMove(event: MouseEvent): void {
    this.pointsArray.push(Point.rpositionMouse(event, this.canvas.nativeElement));
    this.rendrer.setAttribute(this.element, "points", this.pointsToString());
    if(this.contentId !== null && this.contentId !== undefined){
      this.sendProgressToServer(DrawingStatus.InProgress);
    }
  }
  pointsToString(): string{
    let s= "";
    for(let i=0; i< this.pointsArray.length; i++){
      s+= `${this.pointsArray[i].x} ${this.pointsArray[i].y}`;
      if(i < this.pointsArray.length -1){
        s+=",";
      }
    }
    return s;
  }

  getString(): string {
    this.str= "";
    this.str += this.getOriginalString();
    if(this.selected){
      this.getSelectionString()
      this.getScalingPositionsString()
    }
    return this.str;
  }
  getOriginalString(): string {
    let result = "<polyline ";
    let startingPoint = this.element.getAttribute("points")
    let translate = this.element.getAttribute("transform");
    let stroke = this.element.getAttribute("stroke");
    let strokeWidth = this.element.getAttribute("stroke-width");
    result += `points="${startingPoint}" `;
    result += `transform="${translate}" `;
    result += ` stroke="${stroke}"`;
    result += ` stroke-width="${strokeWidth}"`;
    result += ` fill="none"`;
    result += ` stroke-linecap="round"`;
    result += ` stroke-linejoin="round"`;
    result += `/>\n`
    return result;
  }
  inTranslationZone(event: MouseEvent): boolean {
    let position = Point.rpositionMouse(event, this.canvas.nativeElement);
    let inXAxes = (position.x >= this.minPoint.x + this.totalTranslation.x)
                   && (position.x <= this.maxPoint.x + this.totalTranslation.x)
    let inYaxes = (position.y >= this.minPoint.y + this.totalTranslation.y ) &&
                  (position.y <= this.maxPoint.y +this.totalTranslation.y)
    return inXAxes && inYaxes;
  }
  translate(translationPoint: Point): void {
    this.totalTranslation.makeEqualTo(translationPoint)
    this.element.setAttribute("transform", `translate(${this.totalTranslation.x},${this.totalTranslation.y})`)
    this.calculateScalingPositions();
    if(this.contentId !== null && this.contentId !== undefined){
      this.sendProgressToServer(DrawingStatus.Selected);
    }
  }
  scale(scalePoint: Point, direction: Point): void {
    let oldWidth = this.maxPoint.x - this.minPoint.x
    let oldHeight = this.maxPoint.y - this.minPoint.y
    if(direction.x === -1.0){
        this.minPoint.x += scalePoint.x
    }
    else if(direction.x === 1.0){
        this.maxPoint.x += scalePoint.x
    }
    if(direction.y === -1.0){
        this.minPoint.y += scalePoint.y
    }
    else if(direction.y === 1.0){
        this.maxPoint.y += scalePoint.y
    }

    if(this.minPoint.x >= this.maxPoint.x){
        direction.x *= -1
    }

    if(this.minPoint.y >= this.maxPoint.y){
        direction.y *= -1
    }

    let newWidth = this.maxPoint.x - this.minPoint.x
    let newHeight = this.maxPoint.y - this.minPoint.y
    let ratioWidth = newWidth / oldWidth
    let ratioHeight = newHeight / oldHeight

    let differenceWidth = 0.0
    let differenceHeight = 0.0
    if(direction.x === -1.0){
        differenceWidth = (this.maxPoint.x * ratioWidth) - this.maxPoint.x
    }
    else if(direction.x === 1.0){
        differenceWidth = (this.minPoint.x * ratioWidth) - this.minPoint.x
    }

    if(direction.y === -1.0){
        differenceHeight = (this.maxPoint.y* ratioHeight) - this.maxPoint.y
    }
    else if(direction.y === 1.0){
        differenceHeight = (this.minPoint.y * ratioHeight) - this.minPoint.y
    }

    this.pointsArray.forEach((point)=>{
      point.x *= ratioWidth;
      point.x -= differenceWidth;
      point.y *= ratioHeight
      point.y -= differenceHeight;
    })
    this.rendrer.setAttribute(this.element,'points', this.pointsToString())
    this.setCriticalValues()
    this.calculateScalingPositions()
    if(this.contentId !== null && this.contentId !== undefined){
      this.sendProgressToServer(DrawingStatus.Selected);
    }
  }
  getSelectionString(): void {
    //this.stringToPointsArray();
    this.setCriticalValues();
    this.str += "<rect "
    let x = this.minPoint.x
    let y = this.minPoint.y
    let width = this.maxPoint.x - this.minPoint.x
    let height = this.maxPoint.y - this.minPoint.y
    this.str += `x=\"${x}\" `
    this.str += `y=\"${y}\" `
    this.str += `width=\"${width}\"`
    this.str += `height=\"${height}\"`
    let transform = this.element.getAttribute("transform")
    if(transform!== undefined && transform !== null){
      this.str += `transform=${transform}`;
    }
    this.str += " stroke=\"#0000FF\""
    this.str += " stroke-width=\"3\""
    this.str += " fill=\"none\""
    this.str += " stroke-dasharray=\"4\""
    this.str += "/>\n"
  }
  calculateScalingPositions(): void {
    this.scalingPositions.clear()
    let width = this.maxPoint.x - this.minPoint.x
    let height = this.maxPoint.y - this.minPoint.y
    let x = this.minPoint.x
    let y = this.minPoint.y

    let firstPos = new Point(x + this.totalTranslation.x,
        y + this.totalTranslation.y)
    let firstDirection = new Point(-1.0, -1.0)
    this.scalingPositions.set(firstPos, firstDirection)

    let secondPos = new Point(x + (width/2) + this.totalTranslation.x
        , y + this.totalTranslation.y)
    this.scalingPositions.set(secondPos,new Point(0.0,-1.0))

    let thirdPos = new Point(x + width + this.totalTranslation.x,
        y + this.totalTranslation.y)
    this.scalingPositions.set(thirdPos, new Point(1.0, -1.0))

    let forthPos = new Point(x + width + this.totalTranslation.x,
        y + (height/2) + this.totalTranslation.y)
    this.scalingPositions.set(forthPos, new Point(1.0, 0.0))

    let fifthPos = new Point(x + width + this.totalTranslation.x,
        y + height + this.totalTranslation.y)
    this.scalingPositions.set(fifthPos, new Point(1.0,1.0))

    let sixthPos = new Point(x + (width/2) + this.totalTranslation.x,
        y + height + this.totalTranslation.y)
    this.scalingPositions.set(sixthPos,new Point(0.0, 1.0))

    let seventhPos = new Point(x + this.totalTranslation.x,
        y + height + this.totalTranslation.y)
    this.scalingPositions.set(seventhPos, new Point(-1.0, 1.0))

    let eighthPos = new Point(x + this.totalTranslation.x,
        y + (height/2) + this.totalTranslation.y)
    this.scalingPositions.set(eighthPos, new Point(-1.0, 0.0))
  }
  getScalingPoint(point: Point): [Point, Point] | null{
    for(let item of this.scalingPositions){
      let position = item[0]
      let x = position.x - RADUIS
      let y = position.y - RADUIS
      let width = (position.x + RADUIS) - x
      let height = (position.y + RADUIS) - y
      let inXAxes = point.x >= x && point.x <= x+ width
      let inYaxes = point.y >= y && point.y <= y+ height
      if(inXAxes && inYaxes){
        return item;
      }
    }
    return null
  }
  getScalingPositionsString(): void {
    this.calculateScalingPositions()
    for(let item of this.scalingPositions){
      let position = item[0];
      let x = position.x-RADUIS;
      let y = position.y- RADUIS;
      let width = (position.x + RADUIS) - x
      let height = (position.y + RADUIS) - y
      this.str += `<rect x=${x} y=${y} width=${width} height=${height} stroke=#CBCB28 fill=#CBCB28></rect>\n`;
    }
  }
  parse(parceableString: string): void {
    let matchPoints = POINTS_REGEX.exec(parceableString)
    let matchTranslate = TRANSLATE_REGEX.exec(parceableString);
    let matchStroke = STROKE_REGEX.exec(parceableString);
    let matchStrokeWidth = STROKE_WIDTH_REGEX.exec(parceableString);
    if(matchPoints === null){
      console.log("there is a problem with points regex");
    }
    else{
      let pointsGroup = matchPoints[1];
      this.rendrer.setAttribute(this.element, "points", pointsGroup);
    }
    if(matchTranslate === null){
      console.log("there is a problem with translate regex");
    }
    else{
      this.totalTranslation.x = parseFloat(matchTranslate[1])
      this.totalTranslation.y = parseFloat(matchTranslate[2])
      this.rendrer.setAttribute(this.element, "transform", `translate(${this.totalTranslation.x},${this.totalTranslation.y})`)
    }
    if(matchStroke === null){
      console.log("there is a problem with stroke regex")
    }
    else{
      this.rendrer.setAttribute(this.element, "stroke", matchStroke[1])
    }
    if(matchStrokeWidth === null){
      console.log("there is a problem with stroke width regex")
    }
    else{
      this.rendrer.setAttribute(this.element,"stroke-width", matchStrokeWidth[1])
    }
    //this.stringToPointsArray();
    this.setCriticalValues()
  }
  unselect(): void {
    this.selected = false;
    if(this.contentId !== null && this.contentId !== undefined){
      this.sendProgressToServer(DrawingStatus.Done);
    }
  }

  stringToPointsArray(){
    let str = this.element.getAttribute("points");
    this.pointsArray = []
    let pointArrayString = str!.split(",")
    pointArrayString.forEach((str)=>{
      let point = str.split(" ");
      let x = parseFloat(point[0]);
      let y = parseFloat(point[1]);
      this.pointsArray.push(new Point(x, y));
    })
  }
  delete(): void {
    if(this.contentId !== null && this.contentId !== undefined){
      this.sendProgressToServer(DrawingStatus.Deleted);
    }
  }
  updateThickness(): void {
    this.interactionService.$toolsAttributes.subscribe(
      (attr: ToolsAttributes) => {
        if (attr) {
          console.log(attr);
          this.attr = { pencilLineThickness: attr.pencilLineThickness };
          this.rendrer.setAttribute(this.element, "stroke-width", this.attr.pencilLineThickness!.toString())
        }
        else{
          this.attr = {pencilLineThickness: DEF_LINE_THICKNESS};
        }
      }
    )
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  updatePrimaryColor(): void {
    
    this.colorPick.colorSubject.subscribe((color:ChosenColors)=>{
      if(color === undefined){
        this.primaryColor = DEFPRIM;
      }
      else{
        console.log(color);
        this.primaryColor = color.primColor;
        this.rendrer.setAttribute(this.element, "stroke", this.primaryColor);
      }
    })
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  updateSecondaryColor(): void {
  }
  select(): void {
    //this.stringToPointsArray();
    this.selected = true;
    this.sendProgressToServer(DrawingStatus.Selected)
  }
  setCriticalValues(): void {
    this.stringToPointsArray();
    this.minPoint = new Point(Number.MAX_VALUE, Number.MAX_VALUE)
    this.maxPoint = new Point(0.0, 0.0)
    this.pointsArray.forEach((point: Point)=>{
      this.minPoint.x = Math.min(point.x, this.minPoint.x)
      this.minPoint.y = Math.min(point.y, this.minPoint.y)
      this.maxPoint.x = Math.max(point.x, this.maxPoint.x)
      this.maxPoint.y = Math.max(point.y, this.maxPoint.y)
    })
    this.startTransformPoint = this.pointsArray[this.pointsArray.length/2];
  }
  requestCreation(): void{
    this.socketService.createDrawingContentRequest({drawingId: this.drawingId});
  }
  sendProgressToServer(drawingStatus: DrawingStatus){
    let drawingContent: DrawingContent = {drawingId: this.drawingId, userId: this.userId,
                                  id: this.contentId, content: this.getOriginalString(), status: drawingStatus, toolName: this.toolName}
    this.socketService.sendDrawingToServer(drawingContent);                              
  }

}
