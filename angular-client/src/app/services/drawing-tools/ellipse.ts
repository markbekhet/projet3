// import { DrawingStatus } from '@models/DrawingMeta';
import { ElementRef, Renderer2 } from '@angular/core';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { ChosenColors } from '@src/app/models/ChosenColors';
import { DrawingContent, DrawingStatus } from '@src/app/models/DrawingMeta';
//import { DrawingContent, DrawingStatus } from '@src/app/models/DrawingMeta';
//import { AuthService } from '../authentication/auth.service';
//import { DrawingService } from '../drawing/drawing.service';
import { SocketService } from '../socket/socket.service';
import { DrawingTool } from './drawing-tool';
//import { ActiveDrawing, UserToken } from '../static-services/user_token';
// import { DrawingTool } from './drawing-tool';
import { Point } from './point';
//import { Shape } from './shape';
import { ELLIPSE_TOOL_NAME } from './tool-names';
import { ShapeTypes, ToolsAttributes } from './tools-attributes';

const DEF_LINE_THICKNESS = 5;
const DEFPRIM = '#000000ff'
const DEFSEC =  '#ffffffff'
const RADUIS = 10;
const FILL_REGEX = new RegExp(`fill="([#a-zA-Z0-9]+| none)"`);
const STROKE_WIDTH_REGEX = new RegExp(`stroke-width="([0-9]+)"`)
const STROKE_REGEX = new RegExp(`stroke="([#a-zA-Z0-9]+)"`)
const TRANSLATE_REGEX = new RegExp(
  /translate\((-?\d+(?:\.\d*)?),(-?\d+(?:\.\d*)?)\)/
)
const CX_REGEX = new RegExp(`cx="([-?0-9.?]*)"`);
const CY_REGEX = new RegExp(`cy="([-?0-9.?]*)"`);
const RX_REGEX = new RegExp(`rx="([-?0-9.?]*)"`);
const RY_REGEX = new RegExp(`ry="([-?0-9.?]*)"`);

export class Ellipse implements DrawingTool {
  attr!:ToolsAttributes;
  toolName = ELLIPSE_TOOL_NAME;
  currentX: number = 0;
  currentY: number= 0;
  str: string= "<ellipse ";
  selected: boolean = false;;
  startTransformPoint: Point = new Point(0,0);
  totalTranslation: Point = new Point(0,0);
  totalScaling: Point = new Point(0,0);
  scalingPositions: Map<Point, Point> = new Map<Point,Point>();
  contentId!: number;
  userId: string;
  element: SVGEllipseElement;
  drawingId!: number;
  mouseIsDown: boolean = false;
  primaryColor!: string;
  secondaryColor!: string;
  selectionOffset: number = 0;
  startingPositionX!: number;
  startingPositionY!: number;
  constructor(
    private interactionService: InteractionService,
    private colorPick: ColorPickingService,
    private socketService: SocketService,
    userId: string,
    private renderer: Renderer2,
    private canvas: ElementRef,
  ) {
    this.element = this.renderer.createElement('ellipse', 'svg') as SVGEllipseElement;
    this.attr= {shapeLineThickness: DEF_LINE_THICKNESS, shapeType: ShapeTypes.BOTH};
    this.updateThickness();
    this.updatePrimaryColor();
    this.updateSecondaryColor();
    this.userId = userId;
    this.primaryColor = DEFPRIM;
    this.secondaryColor = DEFSEC;
  }
  onMouseDown(event: MouseEvent): void {
    //throw new Error('Method not implemented.');
    this.mouseIsDown = true;
    let position = Point.rpositionMouse(event, this.canvas.nativeElement);
    //this.pointsArray.push(position)
    this.startingPositionX = position.x;
    this.startingPositionY = position.y;
    this.renderer.setAttribute(this.element, "rx", "0")
    this.renderer.setAttribute(this.element, "ry", "0")
    this.renderer.setAttribute(this.element, "cx", `${position.x}`);
    this.renderer.setAttribute(this.element, "cy", `${position.y}`)
    this.renderer.setAttribute(this.element, "transform", "translate(0,0");
    this.renderer.setAttribute(this.element, "stroke", this.primaryColor);
    this.renderer.setAttribute(this.element, "stroke-width", this.attr.shapeLineThickness!.toString())
    this.renderer.setAttribute(this.element, "fill", this.secondaryColor);
    this.requestCreation()
  }
  requestCreation(){
    this.socketService.createDrawingContentRequest({drawingId: this.drawingId});
  }
  onMouseUp(e: MouseEvent): void {
    //throw new Error('Method not implemented.');
    let x = parseFloat(this.element.getAttribute('cx')!)
    let y = parseFloat(this.element.getAttribute('cy')!)
    this.renderer.setAttribute(this.element, 'cx', `${x + this.totalTranslation.x}`)
    this.renderer.setAttribute(this.element, 'cy', `${y + this.totalTranslation.y}`)
    this.totalTranslation.x = 0;
    this.totalTranslation.y = 0;
    this.renderer.setAttribute(this.element, "transform", "translate(0,0)");
    this.setCriticalValues();
    this.calculateScalingPositions();
    this.select();
    this.mouseIsDown = false;
  }
  onMouseMove(event: MouseEvent): void {
    //throw new Error('Method not implemented.');
    if(this.mouseIsDown){
      let position = Point.rpositionMouse(event, this.canvas.nativeElement)
      let rx = Math.abs(position.x - this.startingPositionX)/2
      let ry = Math.abs(position.y - this.startingPositionY)/2;
      this.renderer.setAttribute(this.element, 'rx', rx.toString())
      this.renderer.setAttribute(this.element, "ry", ry.toString())
      this.currentY = position.y;
      this.currentX = position.x;
      let cx = Math.min(this.startingPositionX + rx, this.currentX + rx)
      let cy = Math.min(this.startingPositionY + ry, this.currentY + ry)
      this.renderer.setAttribute(this.element,'cy', cy.toString())
      this.renderer.setAttribute(this.element, 'cx', cx.toString())
      if(this.contentId!== undefined && this.contentId!== null){
        this.sendProgressToServer(DrawingStatus.InProgress);
      }
    }
  }
  sendProgressToServer(drawingStatus: DrawingStatus) {
    //throw new Error('Method not implemented.');
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
    let result = "<ellipse "
    let rx = parseFloat(this.element.getAttribute('rx')!)
    let ry = parseFloat(this.element.getAttribute('ry')!)
    let mx = this.element.getAttribute('cx');
    let my = this.element.getAttribute('cy');
    let transform = this.element.getAttribute('transform');
    let stroke = this.element.getAttribute('stroke');
    let strokeWidth = this.element.getAttribute('stroke-width');
    let fill = this.element.getAttribute('fill');

    result += `rx="${rx}" `;
    result += `ry="${ry}" `;
    result += `cx="${mx}" `;
    result += `cy="${my}" `;
    result += `transform="${transform}" `
    result += `stroke="${stroke}" `;
    result += `stroke-width="${strokeWidth}" `;
    result += `fill="${fill}"`;
    result += "/>\n"
    return result;
  }
  inTranslationZone(event: MouseEvent): boolean {
    //throw new Error('Method not implemented.');
    let position = Point.rpositionMouse(event, this.canvas.nativeElement);
    let cx= parseFloat(this.element.getAttribute('cx')!)
    let cy = parseFloat(this.element.getAttribute('cy')!)
    let rx = parseFloat(this.element.getAttribute('rx')!)
    let ry = parseFloat(this.element.getAttribute('ry')!)
    let isInXAxes = position.x <= cx + rx + this.totalTranslation.x - (RADUIS*2)
                    && position.x >= cx- rx + this.totalTranslation.x - (RADUIS*2)
    let isInYaxes = position.y <= cy + ry + this.totalTranslation.y - (RADUIS*2)
                    && position.y >= cy- ry+ this.totalTranslation.y - (RADUIS*2)
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
    let cx = parseFloat(this.element.getAttribute("cx")!)
    let cy = parseFloat(this.element.getAttribute("cy")!)
    let rx = parseFloat(this.element.getAttribute("rx")!)
    let ry = parseFloat(this.element.getAttribute("ry")!)
    let minPoint = new Point(cx - rx, cy - ry)
    let maxPoint = new Point(cx + rx, cy + ry)
    if(direction.x == -1.0){
        //println(minPoint.x)
        minPoint.x += scalePoint.x
        //println(minPoint.x)
        this.currentX = minPoint.x
    }
    else if(direction.x == 1.0){
        maxPoint.x += scalePoint.x
    }
    if(direction.y == -1.0){
        minPoint.y += scalePoint.y
        this.currentY = minPoint.y
    }
    else if(direction.y == 1.0){
        maxPoint.y += scalePoint.y
    }

    if(minPoint.x >= maxPoint.x){
        direction.x *= -1
    }

    if(minPoint.y >= maxPoint.y){
        direction.y *= -1
    }
    this.renderer.setAttribute(this.element,"ry", (Math.abs(maxPoint.y - minPoint.y)/2).toString())
    this.renderer.setAttribute(this.element,"rx", (Math.abs(maxPoint.x - minPoint.x)/2).toString())

    let newRx = parseFloat(this.element.getAttribute("rx")!)
    let newRY = parseFloat(this.element.getAttribute("ry")!)
    this.renderer.setAttribute(this.element,"cx", (Math.min(maxPoint.x, minPoint.x) + newRx).toString())
    this.renderer.setAttribute(this.element,"cy", (Math.min(maxPoint.x, minPoint.x) + newRY).toString())
    this.sendProgressToServer(DrawingStatus.Selected)
  }
  getSelectionString(): void {
    //throw new Error('Method not implemented.');
    this.str += "<rect "
    let rx = parseFloat(this.element.getAttribute("rx")!)
    let ry = parseFloat(this.element.getAttribute("ry")!)
    let x = parseFloat(this.element.getAttribute("cx")!) - rx
    let y = parseFloat(this.element.getAttribute("cy")!) - ry
    let transform = this.element.getAttribute("transform")
    let width = rx * 2;
    let height = ry * 2;
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
    let rx = parseFloat(this.element.getAttribute("rx")!)
    let ry = parseFloat(this.element.getAttribute("ry")!)
    let cx = parseFloat(this.element.getAttribute("cx")!)
    let cy = parseFloat(this.element.getAttribute("cy")!)
    let firstPos = new Point(cx -rx + this.totalTranslation.x, cy - ry + this.totalTranslation.y)
    let firstDirection = new Point(-1.0, -1.0)
    this.scalingPositions.set(firstPos,firstDirection)

    let secondPos = new Point(cx + this.totalTranslation.x, cy - ry + this.totalTranslation.y)
    this.scalingPositions.set(secondPos, new Point(0.0,-1.0))

    let thirdPos = new Point(cx + rx + this.totalTranslation.x, cy - ry + this.totalTranslation.y)
    this.scalingPositions.set(thirdPos, new Point(1.0, -1.0))

    let forthPos = new Point(cx + rx + this.totalTranslation.x,
        cy + this.totalTranslation.y)
    this.scalingPositions.set(forthPos, new Point(1.0, 0.0))

    let fifthPos = new Point(cx + rx + this.totalTranslation.x,
        cy + ry + this.totalTranslation.y)
    this.scalingPositions.set(fifthPos, new Point(1.0, 0.0))

    let sixthPos = new Point(cx + this.totalTranslation.x
        , cy + ry + this.totalTranslation.y)
    this.scalingPositions.set(sixthPos, new Point(0.0, 1.0))

    let seventhPos = new Point(cx - rx + this.totalTranslation.x
        , cy + ry + this.totalTranslation.y)
    this.scalingPositions.set(seventhPos, new Point(-1.0, 1.0))

    let eighthPos = new Point(cx -rx + this.totalTranslation.x ,
        cy + this.totalTranslation.y)
    this.scalingPositions.set(eighthPos, new Point(-1.0, 0.0))
  }

  getScalingPoint(point: Point): [Point, Point] | null {
    //throw new Error('Method not implemented.');
    for(let item of this.scalingPositions){
      let position = item[0]
      let x = position.x - RADUIS
      let y = position.y - RADUIS
      let width = (position.x + RADUIS) - x
      let height = (position.y + RADUIS) - y
      let inXAxes = point.x >= x && point.y <= x+ width
      let inYaxes = point.y >= y && point.y <= y+ height
      if(inXAxes && inYaxes){
        return item;
      }
    }
    return null
  }
  getScalingPositionsString(): void {
    //throw new Error('Method not implemented.');
    this.calculateScalingPositions();
    for(let item of this.scalingPositions){
      console.log(item)
      let position = item[0];
      let x = position.x-RADUIS;
      let y = position.y- RADUIS;
      let width = (position.x + RADUIS) - x
      let height = (position.y + RADUIS) - y
      this.str += `<rect x=${x} y=${y} width=${width} height=${height} stroke=#CBCB28 fill=#CBCB28></rect>\n`;
    }
  }
  parse(parceableString: string): void {
    let matchCX = CX_REGEX.exec(parceableString);
    if(matchCX=== null){
      console.log("problem with x regex");
    }
    else{
      this.renderer.setAttribute(this.element, "cx", matchCX[1]);
    }
    let matchCY = CY_REGEX.exec(parceableString);
    if(matchCY === null){
      console.log("problem with y regex");
    }
    else{
      this.renderer.setAttribute(this.element, 'cy', matchCY[1])
    }
    let matchRX = RX_REGEX.exec(parceableString);
    if(matchRX === null){
      console.log('problem with width regex');
    }
    else{
      this.renderer.setAttribute(this.element,'rx', matchRX[1])
    }
    let matchRY = RY_REGEX.exec(parceableString);
    if(matchRY === null){
      console.log("problem with height regex");
    }
    else{
      this.renderer.setAttribute(this.element, 'ry', matchRY[1])
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
    //throw new Error('Method not implemented.');
  }
  unselect(): void {
    //throw new Error('Method not implemented.');
    this.mouseIsDown = false;
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
    //throw new Error('Method not implemented.');
    this.interactionService.$toolsAttributes.subscribe(
      (attr: ToolsAttributes) => {
        if (attr) {
          this.attr = { shapeLineThickness: attr.shapeLineThickness, shapeType: attr.shapeType };
        }
        else{
          this.attr = {shapeLineThickness: DEF_LINE_THICKNESS, shapeType: ShapeTypes.BOTH};
        }
      }
    )
  }
  updatePrimaryColor(): void {
    //throw new Error('Method not implemented.');
    this.colorPick.colorSubject.subscribe((color: ChosenColors)=>{
      if(color){
        this.primaryColor = color.primColor;
      }
      else{
        this.primaryColor = DEFPRIM;
      }
    })
  }
  updateSecondaryColor(): void {
    //throw new Error('Method not implemented.');
    this.colorPick.colorSubject.subscribe((color: ChosenColors)=>{
      if(color){
        this.secondaryColor = color.primColor;
      }
      else{
        this.secondaryColor = DEFPRIM;
      }
    })
  }
  select(): void {
    //throw new Error('Method not implemented.');
    this.mouseIsDown = true;
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

  /*updateAttributes() {
    this.interactionService.$toolsAttributes.subscribe(
      (attr: ToolsAttributes) => {
        if (attr) {
          this.attr = {
            shapeLineThickness: attr.shapeLineThickness,
            shapeType: attr.shapeType,
          };
        }
      }
    );
  }

  setDimensions(p: Point[]): void {
    this.startX = this.width > 0 ? p[0].x : p[p.length - 1].x;
    this.startY = this.height > 0 ? p[0].y : p[p.length - 1].y;

    super.setDimensions(p);
    // Rectangle
  }

  // this is the function used to write the string
  createPath(p: Point[]): string {
    this.toolName = ELLIPSE_TOOL_NAME;
    this.svgString = '';

    this.setDimensions(p);
    this.svgString += `<ellipse cx="${this.startX + Math.abs(this.width / 2)}"`;
    this.svgString += ` cy="${this.startY + Math.abs(this.height / 2)}"`;
    this.svgString += ` rx="${Math.abs(this.width / 2)}"`;
    this.svgString += ` ry="${Math.abs(this.height / 2)}"`;

    this.setAttributesToPath();

    // end the divider
    // this.svgString += '/>';

    // can't have rectangle with 0 width or height
    if (this.width === 0 || this.height === 0) {
      // this.svgString = '';
    }
    //let data: DrawingContent ={id: this.drawingContentID, userId: this.userToken,
      // content: this.svgString, status: drawingStatus, drawingId: this.drawingId, toolName: this.toolName};
    //this.socketService.sendDrawingToServer(data);
    return this.svgString;
  }*/
}
