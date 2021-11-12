//import { ComponentFactoryResolver } from '@angular/core';
import { /*DrawingContent,*/ DrawingContent, DrawingStatus } from '@models/DrawingMeta';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { ChosenColors } from '@src/app/models/ChosenColors';
import { SocketService } from '../socket/socket.service';
//import { ActiveDrawing, UserToken } from '../static-services/user_token';
//import { ActiveDrawing, UserToken } from '../static-services/user_token';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { PENCIL_TOOL_NAME } from './tool-names';
import { ToolsAttributes } from './tools-attributes';

const DEF_LINE_THICKNESS = 5;
const RADUIS = 5;
const STROKE_WIDTH_REGEX = new RegExp(`stroke-width="([0-9.?]*)"`);
const STROKE_REGEX = new RegExp(`stroke="(#([0-9a-fA-F]{8})|none)"`);
const FILL_REGEX = new RegExp(`fill="(#([0-9a-fA-F]{8})|none)"`);

// Crayon
const POINTS_REGEX = new RegExp(
  `points="([0-9.?]+ [0-9.?]+(,[0-9.?]+ [0-9.?]+)*)`
);
const TRANSLATE_REGEX = new RegExp(
  `translate(([-?0-9.?]+),([-?0-9.?]+))`
)

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
  startTransformPoint: Point = new Point(0,0);
  totalTranslation: Point = new Point(0,0);
  totalScaling: Point = new Point(0,0);
  scalingPositions: Map<Point, Point> = new Map<Point, Point>();
  contentId!: number;
  userId: string;
  element: SVGPolylineElement = new SVGPolylineElement();
  primaryColor! :string;
  constructor(
    private interactionService: InteractionService,
    private colorPick: ColorPickingService,
    private socketService: SocketService,
    private drawaingId: number,
    userId: string,
  ) {
    this.updateThickness();
    this.updatePrimaryColor();
    this.userId = userId;
  }
  onMouseDown(event: MouseEvent): void {
    //throw new Error('Method not implemented.');
    this.element.setAttribute("points", `${event.x} ${event.y}`),
    this.element.setAttribute("transform", "translate(0,0)");
    this.element.setAttribute("stroke-width", `${this.attr.pencilLineThickness}`);
    this.element.setAttribute("stroke", `${this.primaryColor}`)
    this.requestCreation();
  }

  onMouseUp(): void {
    //throw new Error('Method not implemented.');
    let polylinePoints = this.element.points;
    if(polylinePoints.numberOfItems > 0){
      let i = 0;
      while(i< polylinePoints.numberOfItems){
        let item = polylinePoints.getItem(i)
        item.x += this.totalTranslation.x
        item.y += this.totalTranslation.y;
        i++
      }
    }
    this.totalTranslation = new Point(0,0);
    this.element.setAttribute("transform", "translate(0,0)");
    this.setCriticalValues()
    this.calculateScalingPositions()
    this.select()
  }

  onMouseMove(event: MouseEvent): void {
    //throw new Error('Method not implemented.');
    let existingPoints = this.element.getAttribute("points")
    this.element.setAttribute("points", `${existingPoints}, ${event.x} ${event.y}`)
    if(this.contentId !== null && this.contentId !== undefined){
      
    }
  }
  getString(): string {
    //throw new Error('Method not implemented.');
    this.str= "";
    this.str += this.getOriginalString();
    if(this.selected){
      this.getSelectionString()
      this.getScalingPositionsString()
    }
    return this.str;
  }
  getOriginalString(): string {
    //throw new Error('Method not implemented.');
    let result = "<polyline ";
    let startingPoint = this.element.getAttribute("points")
    let translate = this.element.getAttribute("transform");
    let stroke = this.element.getAttribute("stroke");
    let strokeWidth = this.element.getAttribute("stroke-width");
    result += `points=${startingPoint} `;
    result += `transform=${translate} `;
    result += ` stroke${stroke}`;
    result += ` stroke-width=${strokeWidth}`;
    result += ` fill=none`;
    result += ` stroke-linecap=round`;
    result += ` stroke-linejoin=round`;
    result += `/>\n`
    return result;
  }
  inTranslationZone(event: MouseEvent): boolean {
    //throw new Error('Method not implemented.');
    let inXAxes = (event.x >= this.minPoint.x + this.totalTranslation.x)
                   && (event.x <= this.maxPoint.x + this.totalTranslation.x)
    let inYaxes = (event.y >= this.minPoint.y + this.totalTranslation.y ) &&
                  (event.y <= this.maxPoint.y +this.totalTranslation.y)
    return inXAxes && inYaxes;
  }
  translate(translationPoint: Point): void {
    //throw new Error('Method not implemented.');
    this.totalTranslation.makeEqualTo(translationPoint)
    this.element.setAttribute("transform", `translate(${this.totalTranslation.x},${this.totalTranslation.y})`)
    this.calculateScalingPositions();
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  scale(scalePoint: Point, direction: Point): void {
    //throw new Error('Method not implemented.');
    let oldWidth = this.maxPoint.x - this.minPoint.x
    let oldHeight = this.maxPoint.y - this.minPoint.y
    if(direction.x == -1.0){
        this.minPoint.x += scalePoint.x
        //currentX = minPoint.x
    }
    else if(direction.x == 1.0){
        this.maxPoint.x += scalePoint.x
    }
    if(direction.y == -1.0){
        this.minPoint.y += scalePoint.y
        //currentY = minPoint.y
    }
    else if(direction.y == 1.0){
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
    if(direction.x == -1.0){
        differenceWidth = (this.maxPoint.x * ratioWidth) - this.maxPoint.x
    }
    else if(direction.x == 1.0){
        differenceWidth = (this.minPoint.x * ratioWidth) - this.minPoint.x
    }

    if(direction.y == -1.0){
        differenceHeight = (this.maxPoint.y* ratioHeight) - this.maxPoint.y
    }
    else if(direction.y == 1.0){
        differenceHeight = (this.minPoint.y * ratioHeight) - this.minPoint.y
    }

    let polylinePoints = this.element.points
    if(polylinePoints.numberOfItems > 0){
        var i = 0
        while(i < polylinePoints.numberOfItems){
            let item = polylinePoints.getItem(i)
            item.x *= ratioWidth
            item.x -= differenceWidth
            item.y *= ratioHeight
            item.y -= differenceHeight
            i++
        }
    }
    this.setCriticalValues()
    this.calculateScalingPositions()
    this.sendProgressToServer(DrawingStatus.Selected)
  }
  getSelectionString(): void {
    //throw new Error('Method not implemented.');
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
    //throw new Error('Method not implemented.');
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
    this.calculateScalingPositions()
    for(let item of this.scalingPositions){
      let position = item[0];
      let x = position.x-RADUIS;
      let y = position.y- RADUIS;
      let width = (position.x + RADUIS) - x
      let height = (position.y + RADUIS) - y
      this.str += `<rect x=${x} y=${y} width=${width} height=${height} stroke=#CBCB28 fill=#CBCB28/>\n`;
    }
  }
  parse(parceableString: string): void {
    //throw new Error('Method not implemented.');
    let matchPoints = POINTS_REGEX.exec(parceableString)
    let matchTranslate = TRANSLATE_REGEX.exec(parceableString);
    let matchStroke = STROKE_REGEX.exec(parceableString);
    let matchStrokeWidth = STROKE_WIDTH_REGEX.exec(parceableString);
    let matchFill = FILL_REGEX.exec(parceableString);
    if(matchPoints === null){
      console.log("there is a problem with points regex");
    }
    else{
      let pointsGroup = matchPoints[1];
      this.element.setAttribute('points', pointsGroup);
    }
    if(matchTranslate === null){
      console.log("there is a problem with translate regex");
    }
    else{
      this.totalTranslation.x = Number(matchTranslate[1])
      this.totalTranslation.y = Number(matchTranslate[2])
      this.element.setAttribute("tranform", `translate(${this.totalTranslation.x},${this.totalTranslation.y})`)
    }
    if(matchStroke === null){
      console.log("there is a problem with stroke regex")
    }
    else{
      this.element.setAttribute("stroke",matchStroke[1])
    }
    if(matchStrokeWidth === null){
      console.log("there is a problem with stroke width regex")
    }
    else{
      this.element.setAttribute("stroke-width", matchStrokeWidth[1])
    }
    if(matchFill=== null){
      console.log("there is a problem with fill regex");
    }
    else{
      this.element.setAttribute('fill', matchFill[1]);
    }
    this.setCriticalValues()
  }
  unselect(): void {
    //throw new Error('Method not implemented.');
    this.selected = false;
    this.sendProgressToServer(DrawingStatus.Selected);
  }
  delete(): void {
    //throw new Error('Method not implemented.');
    this.sendProgressToServer(DrawingStatus.Deleted);
  }
  updateThickness(): void {
    //throw new Error('Method not implemented.');
    this.interactionService.$toolsAttributes.subscribe(
      (attr: ToolsAttributes) => {
        if (attr) {
          this.attr = { pencilLineThickness: attr.pencilLineThickness };
        }
        else{
          this.attr = {pencilLineThickness: DEF_LINE_THICKNESS};
        }
      }
    )
  }
  updatePrimaryColor(): void {
    //throw new Error('Method not implemented.');
    const DEFPRIM = '#000000ff';
    this.colorPick.colorSubject.subscribe((color:ChosenColors)=>{
      if(color === undefined){
        this.primaryColor = DEFPRIM;
      }
      else{
        this.primaryColor = color.primColor;
      }
    })
  }
  updateSecondaryColor(): void {
    //throw new Error('Method not implemented.');
  }
  select(): void {
    //throw new Error('Method not implemented.');
    this.selected = true;
    this.sendProgressToServer(DrawingStatus.Selected)
  }
  setCriticalValues(): void {
    //throw new Error('Method not implemented.');
    this.minPoint = new Point(Number.MAX_VALUE, Number.MAX_VALUE)
    this.maxPoint = new Point(0.0, 0.0)
    let polylinePoints = this.element.points;
    if(polylinePoints.numberOfItems > 0){
      let i = 0;
      while(i< polylinePoints.numberOfItems){
        let item = polylinePoints.getItem(i)
        this.minPoint.x = Math.min(item.x, this.minPoint.x)
        this.minPoint.y = Math.min(item.y, this.minPoint.y)
        this.maxPoint.x = Math.max(item.x, this.maxPoint.x)
        this.maxPoint.y = Math.max(item.y, this.maxPoint.y)
        i++;
      }
      this.startTransformPoint = new Point(polylinePoints.getItem(polylinePoints.numberOfItems/2).x,
                    polylinePoints.getItem(polylinePoints.numberOfItems/2).y);
    }
  }
  requestCreation(): void{
    // To change
    this.socketService.createDrawingContentRequest({drawingId: this.drawaingId});
  }
  sendProgressToServer(drawingStatus: DrawingStatus){
    let drawingContent: DrawingContent = {drawingId: this.drawaingId, userId: this.userId,
                                  id: this.contentId, content: this.getOriginalString(), status: drawingStatus, toolName: this.toolName}
    this.socketService.sendDrawingToServer(drawingContent);                              
  }

  down(event: MouseEvent, position: Point) {
  }

  up(event: MouseEvent, position: Point, insideWorkspace: boolean) {
  }

  move(event: MouseEvent, position: Point) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  doubleClick(Position: Point) {}

  // this is the function used to write the string
  createPath(p: Point[]) {
    /*this.toolName = PENCIL_TOOL_NAME;
    let s = '';
    if (p.length < 2) {
      return s;
    }
    s = `<polyline `;
    s += `points="`;
    for (let i = 0; i < p.length; i++) {
      s += `${p[i].x} ${p[i].y}`;
      if (i !== p.length - 1) {
        s += ',';
      }
    }
    // eslint-disable-next-line no-useless-escape
    s += `\" stroke="${this.chosenColor.primColor}" fill="none"`;
    // Replace the number by the width chosen in the component
    s += ` stroke-width="${this.attr.pencilLineThickness}"`;
    s += ` transform="translate(0,0)"`;
    s += '/>\n';
    // console.log(s)
    console.log(this.drawingId);
    //let data: DrawingContent = {id: this.drawingContentID, userId: this.userToken,
    //   content: s, status: drawingStatus, drawingId: this.drawingId, toolName: this.toolName};
    //this.socketService.sendDrawingToServer(data);
    return s;*/
  }

  updateMinMaxPoints(position: Point) {
    //x 
    /*if (position.x > this.maxPoint.x) {
        this.maxPoint.x = position.x;
    } else if (position.x < this.minPoint.x) {
        this.minPoint.x = position.x;
    }
    //y
    if (position.y > this.maxPoint.y) {
        this.maxPoint.y = position.y;
    } else if (position.y < this.minPoint.y) {
        this.minPoint.y = position.y;
    }*/
  }

  objectPressed(position: Point): boolean {
    /*let inXAxes = (position.x >= minPoint.x + totalTranslation.x)
        && (eventX <= maxPoint.x + totalTranslation.x)
    let inYaxes = (eventY >= minPoint.y + totalTranslation.y)
        && (eventY <= maxPoint.y + totalTranslation.y)
    return inXAxes && inYaxes*/

    const xAxis: boolean = (position.x > this.minPoint.x) && (position.x < this.maxPoint.x);
    const yAxis: boolean = (position.y > this.minPoint.y) && (position.y < this.maxPoint.y);
    return xAxis && yAxis;

  }
}
