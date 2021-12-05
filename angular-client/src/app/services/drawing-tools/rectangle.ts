// import { DrawingStatus } from '@models/DrawingMeta';
import { ElementRef, Renderer2 } from '@angular/core';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { ChosenColors } from '@src/app/models/ChosenColors';
import { DrawingContent, DrawingStatus } from '@src/app/models/DrawingMeta';
import { userColorMap } from '../drawing/drawing.service';
//import { DrawingContent, DrawingStatus } from '@src/app/models/DrawingMeta';
import { SocketService } from '../socket/socket.service';
import { DrawingTool } from './drawing-tool';
//import { ActiveDrawing, UserToken } from '../static-services/user_token';
// import { DrawingTool } from './drawing-tool';
import { Point } from './point';
//import { Shape } from './shape';
import { RECT_TOOL_NAME } from './tool-names';
import { ShapeTypes, ToolsAttributes } from './tools-attributes';

const DEFPRIM = '#000000ff'
const DEFSEC =  '#ffffffff'
const RADUIS = 10;
const X_REGEX = new RegExp(`x="([-?0-9.?]*)"`);
const Y_REGEX = new RegExp(`y="([-?0-9.?]*)"`);
const WIDTH_REGEX = new RegExp(`width="([-?0-9.?]*)"`);
const HEIGHT_REGEX = new RegExp(`height="([-?0-9.?]*)"`);
const FILL_REGEX = new RegExp(`fill="([#a-zA-Z0-9]+| none)"`);
const STROKE_WIDTH_REGEX = new RegExp(`stroke-width="([0-9]+)"`)
const STROKE_REGEX = new RegExp(`stroke="([#a-zA-Z0-9]+)"`)
const TRANSLATE_REGEX = new RegExp(
  /translate\((-?\d+(?:\.\d*)?),(-?\d+(?:\.\d*)?)\)/
)
export class Rectangle implements  DrawingTool{
  attr!:ToolsAttributes;
  toolName = RECT_TOOL_NAME;
  currentX: number = 0;
  currentY: number = 0;
  str: string= "<rect ";
  selected: boolean = false;
  startTransformPoint: Point = new Point(0,0);
  totalTranslation: Point = new Point(0,0);
  totalScaling: Point = new Point(0,0);
  scalingPositions: Map<Point, Point> = new Map<Point,Point>();
  contentId!: number;
  userId: string;
  element: SVGRectElement;
  drawingId!: number;
  //mouseIsDown: boolean = false;
  primaryColor!: string;
  secondaryColor!: string;
  //pointsArray: Point[];
  selectionOffset: number = 0;
  constructor(
    private interactionService: InteractionService,
    private colorPick: ColorPickingService,
    private socketService: SocketService,
    userId: string,
    private renderer: Renderer2,
    private canvas: ElementRef,
  ) {
    this.element = this.renderer.createElement('rect', 'svg') as SVGRectElement;
    //this.attr= {shapeLineThickness: DEF_LINE_THICKNESS, shapeType: ShapeTypes.BOTH};
    let attr = this.interactionService.toolsAttributes$.value;
    this.attr = {shapeLineThickness: attr.shapeLineThickness, shapeType: attr.shapeType}
    this.userId = userId;
    this.primaryColor = colorPick.cData.primaryColor;
    this.secondaryColor = colorPick.cData.secondaryColor;
  }

  onMouseDown(event: MouseEvent): void {
    //this.mouseIsDown = true;
    let position = Point.rpositionMouse(event, this.canvas.nativeElement);
    //this.pointsArray.push(position)
    this.renderer.setAttribute(this.element, "x", position.x.toString())
    this.renderer.setAttribute(this.element, "y", position.y.toString())
    this.renderer.setAttribute(this.element, "width", "0");
    this.renderer.setAttribute(this.element, "height", "0")
    this.renderer.setAttribute(this.element, "transform", "translate(0,0)");
    //this.renderer.setAttribute(this.element, "stroke", this.primaryColor);
    this.renderer.setAttribute(this.element, "stroke-width", this.attr.shapeLineThickness!.toString())
    //this.renderer.setAttribute(this.element, "fill", this.secondaryColor);
    if(this.attr.shapeType === ShapeTypes.OUTLINE){
      this.renderer.setAttribute(this.element, "stroke", this.primaryColor);
      this.renderer.setAttribute(this.element, "fill", "none");  
    }
    else if(this.attr.shapeType === ShapeTypes.FULL){
      this.renderer.setAttribute(this.element, "stroke", "none");
      this.renderer.setAttribute(this.element, "fill", this.secondaryColor);
    }
    else{
      this.renderer.setAttribute(this.element, "stroke", this.primaryColor);
      this.renderer.setAttribute(this.element, "fill", this.secondaryColor);
    }
    this.requestCreation()
  }

  requestCreation(){
    this.socketService.createDrawingContentRequest({drawingId: this.drawingId});
  }
  onMouseUp(e: MouseEvent): void {
    let x = parseFloat(this.element.getAttribute('x')!)
    let y = parseFloat(this.element.getAttribute('y')!)
    this.renderer.setAttribute(this.element, 'x', `${x + this.totalTranslation.x}`)
    this.renderer.setAttribute(this.element, 'y', `${y + this.totalTranslation.y}`)
    this.totalTranslation.x = 0;
    this.totalTranslation.y = 0;
    this.renderer.setAttribute(this.element, "transform", "translate(0,0)");
    this.setCriticalValues();
    this.calculateScalingPositions();
    this.select();
    //this.mouseIsDown = false;
    //throw new Error('Method not implemented.');
  }
  onMouseMove(event: MouseEvent): void {
    //throw new Error('Method not implemented.');
    let position = Point.rpositionMouse(event, this.canvas.nativeElement)
    let width = Math.abs(position.x - parseFloat(this.element.getAttribute('x')!))
    let height = Math.abs(position.y - parseFloat(this.element.getAttribute('y')!));
    this.renderer.setAttribute(this.element, 'width', width.toString())
    this.renderer.setAttribute(this.element, "height", height.toString())
    this.currentY = position.y;
    this.currentX = position.x;
    let x = parseFloat(this.element.getAttribute('x')!)
    let y = parseFloat(this.element.getAttribute('y')!)
    this.renderer.setAttribute(this.element,'y', Math.min(this.currentY,y).toString())
    this.renderer.setAttribute(this.element, 'x', Math.min(this.currentX, x).toString())
    if(this.contentId!== undefined && this.contentId!== null){
      this.sendProgressToServer(DrawingStatus.InProgress);
    }
  }
  sendProgressToServer(drawingStatus: DrawingStatus){
    let drawingContent: DrawingContent = {drawingId: this.drawingId, userId: this.userId,
      id: this.contentId, content: this.getOriginalString(), status: drawingStatus, toolName: this.toolName}
    this.socketService.sendDrawingToServer(drawingContent);
  }
  getString(): string {
    //throw new Error('Method not implemented.');
    this.str = "";
    this.str += this.getOriginalString();
    if(this.selected){
      this.getSelectionString();
      this.getScalingPositionsString();
    }
    return this.str;
  }
  getOriginalString(): string {
    //throw new Error('Method not implemented.');
    let result = "<rect "
    let x = parseFloat(this.element.getAttribute('x')!)
    let y = parseFloat(this.element.getAttribute('y')!)
    let width = this.element.getAttribute('width');
    let height = this.element.getAttribute('height');
    let transform = this.element.getAttribute('transform');
    let stroke = this.element.getAttribute('stroke');
    let strokeWidth = this.element.getAttribute('stroke-width');
    let fill = this.element.getAttribute('fill');

    result += `x="${x}" `;
    result += `y="${y}" `;
    result += `width="${width}" `;
    result += `height="${height}" `;
    result += `transform="${transform}" `
    result += `stroke="${stroke}" `;
    result += `stroke-width="${strokeWidth}" `;
    result += `fill="${fill}"`;
    result += "/>\n";
    return result;
  }
  inTranslationZone(event: MouseEvent): boolean {
    //throw new Error('Method not implemented.');
    let position = Point.rpositionMouse(event, this.canvas.nativeElement);
    let x= parseFloat(this.element.getAttribute('x')!)
    let y = parseFloat(this.element.getAttribute('y')!)
    let width = parseFloat(this.element.getAttribute('width')!)
    let height = parseFloat(this.element.getAttribute('height')!)
    let isInXAxes = position.x <= x + width + (2* this.selectionOffset) + this.totalTranslation.x
                    && position.x >= x- this.selectionOffset + this.totalTranslation.x
    let isInYaxes = position.y <= y + height + (2* this.selectionOffset) + this.totalTranslation.y
                    && position.y >= y- this.selectionOffset + this.totalTranslation.y
    return isInXAxes && isInYaxes;
  }
  translate(translationPoint: Point): void {
    //throw new Error('Method not implemented.');
    this.totalTranslation.makeEqualTo(translationPoint);
    this.renderer.setAttribute(this.element, 'transform', `translate(${this.totalTranslation.x},${this.totalTranslation.y})`)
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  scale(scalePoint: Point, direction: Point): void {
    //throw new Error('Method not implemented.');
    let x = parseFloat(this.element.getAttribute("x")!)
    let y = parseFloat(this.element.getAttribute("y")!)
    let width = parseFloat(this.element.getAttribute("width")!)
    let height = parseFloat(this.element.getAttribute("height")!)
    let minPoint = new Point(x , y)
    let maxPoint = new Point(x + width, y + height)
    if(direction.x === -1.0){
        //println(minPoint.x)
        minPoint.x += scalePoint.x
        //println(minPoint.x)
        this.currentX = minPoint.x
    }
    else if(direction.x === 1.0){
        maxPoint.x += scalePoint.x
    }
    if(direction.y === -1.0){
        minPoint.y += scalePoint.y
        this.currentY = minPoint.y
    }
    else if(direction.y === 1.0){
        maxPoint.y += scalePoint.y
    }

    if(minPoint.x >= maxPoint.x){
        direction.x *= -1
    }

    if(minPoint.y >= maxPoint.y){
        direction.y *= -1
    }
    this.renderer.setAttribute(this.element,"y", Math.min(minPoint.y,maxPoint.y).toString())
    this.renderer.setAttribute(this.element,"x", Math.min(minPoint.x,maxPoint.x).toString())
    this.renderer.setAttribute(this.element,"width", Math.abs(maxPoint.x - minPoint.x).toString())
    this.renderer.setAttribute(this.element,"height", Math.abs(maxPoint.y - minPoint.y).toString())
    this.sendProgressToServer(DrawingStatus.Selected)
  }
  getSelectionString(): void {
    //throw new Error('Method not implemented.');
    this.str += "<rect "
    let x = parseFloat(this.element.getAttribute("x")!)
    let y = parseFloat(this.element.getAttribute("y")!)
    let width = parseFloat(this.element.getAttribute("width")!)
    let height = parseFloat(this.element.getAttribute("height")!)
    let transform = this.element.getAttribute("transform")

    this.str += `x="${x}" `
    this.str += `y="${y}" `
    this.str += `width="${width}" `

    this.str += `height="${height}" `
    this.str += `transform="${transform}" `

    this.str += `stroke="#0000FF" `
    this.str += `stroke-width="3" `
    this.str += `fill="none" `
    this.str += `stroke-dasharray="4"`
    this.str += "/>\n"
  }
  calculateScalingPositions(): void {
    //throw new Error('Method not implemented.');
    this.scalingPositions.clear()
    let width = parseFloat(this.element.getAttribute("width")!)
    let height = parseFloat(this.element.getAttribute("height")!)
    let x = parseFloat(this.element.getAttribute("x")!)
    let y = parseFloat(this.element.getAttribute("y")!)
    let firstPos = new Point(x + this.totalTranslation.x, y + this.totalTranslation.y)
    let firstDirection = new Point(-1.0, -1.0)
    this.scalingPositions.set(firstPos,firstDirection)

    let secondPos = new Point(x + (width/2) + this.totalTranslation.x, y + this.totalTranslation.y)
    this.scalingPositions.set(secondPos, new Point(0.0,-1.0))

    let thirdPos = new Point(x + width + this.totalTranslation.x, y + this.totalTranslation.y)
    this.scalingPositions.set(thirdPos, new Point(1.0, -1.0))

    let forthPos = new Point(x + width + this.totalTranslation.x,
        y + (height/2) + this.totalTranslation.y)
    this.scalingPositions.set(forthPos, new Point(1.0, 0.0))

    let fifthPos = new Point(x + width + this.totalTranslation.x,
        y + height + this.totalTranslation.y)
    this.scalingPositions.set(fifthPos, new Point(1.0, 1.0))

    let sixthPos = new Point(x + (width/2) + this.totalTranslation.x
        , y + height + this.totalTranslation.y)
    this.scalingPositions.set(sixthPos, new Point(0.0, 1.0))

    let seventhPos = new Point(x + this.totalTranslation.x
        , y + height + this.totalTranslation.y)
    this.scalingPositions.set(seventhPos, new Point(-1.0, 1.0))

    let eighthPos = new Point(x + this.totalTranslation.x ,
        y + (height/2) + this.totalTranslation.y)
    this.scalingPositions.set(eighthPos, new Point(-1.0, 0.0))
  }
  getScalingPoint(point: Point): [Point, Point] | undefined {
    //throw new Error('Method not implemented.');
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
    return undefined;
  }
  getScalingPositionsString(): void {
    //throw new Error('Method not implemented.');
    let color: string = "";
    let mapEntries = userColorMap.entries();
    for(const entry of mapEntries){
      if(entry[1]!==undefined && entry[1] === this.userId){
        color = entry[0];
        break;
      }
    }
    this.calculateScalingPositions()
    for(let item of this.scalingPositions){
      console.log(item)
      let position = item[0];
      let x = position.x-RADUIS;
      let y = position.y- RADUIS;
      let width = (position.x + RADUIS) - x
      let height = (position.y + RADUIS) - y
      this.str += `<rect x=${x} y=${y} width=${width} height=${height} stroke=${color} fill=${color}></rect>\n`;
    }
  }

  parse(parceableString: string): void {
    //throw new Error('Method not implemented.');
    let matchX = X_REGEX.exec(parceableString);
    if(matchX=== null){
      console.log("problem with x regex");
    }
    else{
      this.renderer.setAttribute(this.element, "x", matchX[1]);
    }
    let matchY = Y_REGEX.exec(parceableString);
    if(matchY === null){
      console.log("problem with y regex");
    }
    else{
      this.renderer.setAttribute(this.element, 'y', matchY[1])
    }
    let matchWidth = WIDTH_REGEX.exec(parceableString);
    if(matchWidth === null){
      console.log('problem with width regex');
    }
    else{
      this.renderer.setAttribute(this.element,'width', matchWidth[1])
    }
    let matchHeight = HEIGHT_REGEX.exec(parceableString);
    if(matchHeight === null){
      console.log("problem with height regex");
    }
    else{
      this.renderer.setAttribute(this.element, 'height', matchHeight[1])
    }
    let matchTranslate = TRANSLATE_REGEX.exec(parceableString);
    if(matchTranslate === null){
      console.log("problem with with translate regex");
    }
    else{
      this.renderer.setAttribute(this.element, 'transform', `translate(${matchTranslate[1]},${matchTranslate[2]})`)
      this.totalTranslation.x = parseFloat(matchTranslate[1]);
      this.totalTranslation.y = parseFloat(matchTranslate[2])
    }
    let matchStroke = STROKE_REGEX.exec(parceableString);
    if(matchStroke === null){
      console.log("problem with stroke regex");
    }
    else{
      this.renderer.setAttribute(this.element, 'stroke', matchStroke[1])
    }
    let matchStrokeWidth = STROKE_WIDTH_REGEX.exec(parceableString);
    if(matchStrokeWidth === null){
      console.log("problem with stroke-width regex")
    }
    else{
      this.renderer.setAttribute(this.element, 'stroke-width', matchStrokeWidth[1])
    }
    let matchFill = FILL_REGEX.exec(parceableString);
    if(matchFill === null){
      console.log("problem with fill regex")
    }
    else{
      this.renderer.setAttribute(this.element, "fill", matchFill[1])
    }
    this.setCriticalValues();
  }
  unselect(): void {
    //throw new Error('Method not implemented.');
    //this.mouseIsDown = false;
    this.selected = false;
    if(this.contentId !== null && this.contentId !== undefined){
      this.sendProgressToServer(DrawingStatus.Done);
    }
  }
  delete(): void {
    //throw new Error('Method not implemented.');
    if(this.contentId !== null && this.contentId !== undefined){
      this.sendProgressToServer(DrawingStatus.Deleted);
    }
  }
  updateThickness(): void {
    let attr = this.interactionService.toolsAttributes$.value;
    this.attr = {shapeLineThickness: attr.shapeLineThickness, shapeType: attr.shapeType}
    if(this.attr.shapeType === ShapeTypes.OUTLINE){
      this.renderer.setAttribute(this.element, "fill", "none");
      this.renderer.setAttribute(this.element, "stroke", this.primaryColor);
    }
    else if(this.attr.shapeType === ShapeTypes.FULL){
      this.renderer.setAttribute(this.element, "stroke", "none");
      this.renderer.setAttribute(this.element, "fill", this.secondaryColor);
    }
    else{
      this.renderer.setAttribute(this.element, "stroke", this.primaryColor);
      this.renderer.setAttribute(this.element, "fill", this.secondaryColor);
    }
    this.renderer.setAttribute(this.element, "stroke-width", attr.shapeLineThickness!.toString())
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  updatePrimaryColor(): void {
    //throw new Error('Method not implemented.');
    this.colorPick.colorSubject.subscribe((color: ChosenColors)=>{
      if(color!== undefined){
        this.primaryColor = color.primColor;
        if(this.attr.shapeType!== undefined){
          if(this.attr.shapeType === ShapeTypes.FULL){
            this.renderer.setAttribute(this.element, "stroke", DEFSEC)
          }
          else{
            this.renderer.setAttribute(this.element, "stroke", this.primaryColor)
          }
        }
      }
      else{
        this.primaryColor = DEFPRIM;
        this.renderer.setAttribute(this.element, "stroke", this.primaryColor)
      }
    })
    // To send To server
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  updateSecondaryColor(): void {
    //throw new Error('Method not implemented.');
    this.colorPick.colorSubject.subscribe((color: ChosenColors)=>{
      if(color !== undefined){
        this.secondaryColor = color.secColor;
        if(this.attr.shapeType !== undefined){
          if(this.attr.shapeType === ShapeTypes.OUTLINE){
            this.renderer.setAttribute(this.element, "fill", DEFSEC)
          }
          else{
            this.renderer.setAttribute(this.element, "fill", this.secondaryColor)
          }
        }
      }
      else{
        this.secondaryColor = DEFSEC;
        this.renderer.setAttribute(this.element, "fill", this.secondaryColor)
      }
    })
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  select(): void {
    //throw new Error('Method not implemented.');
    //this.mouseIsDown = true;
    this.selected = true;
    this.sendProgressToServer(DrawingStatus.Selected)
  }
  setCriticalValues(): void {
    //throw new Error('Method not implemented.');
    let xCert = parseFloat(this.element.getAttribute('x')!)
    let yCert = parseFloat(this.element.getAttribute('y')!)
    let widthCert = parseFloat(this.element.getAttribute('width')!)
    let heightCert = parseFloat(this.element.getAttribute('height')!)
    this.startTransformPoint.x = xCert + (widthCert/2)
    this.startTransformPoint.y = yCert + (heightCert/2)
  }
}
