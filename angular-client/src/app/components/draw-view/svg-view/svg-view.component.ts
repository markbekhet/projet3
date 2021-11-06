import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Canvas } from 'src/app/models/canvas';
import { DrawingContent, DrawingStatus } from 'src/app/models/drawing-content';
import { CanvasBuilderService } from 'src/app/services/canvas-builder/canvas-builder.service';
import { ColorPickingService } from 'src/app/services/color-picker/color-picking.service';
import { DrawingTool } from 'src/app/services/draw-tool/drawing-tool';
import { Ellipse } from 'src/app/services/draw-tool/ellipse';
import { InputObserver } from 'src/app/services/draw-tool/input-observer';
import { Pencil } from 'src/app/services/draw-tool/pencil';
import { Rectangle } from 'src/app/services/draw-tool/rectangle';
import { Selection } from 'src/app/services/draw-tool/selection';
import { InteractionService } from 'src/app/services/interaction-service/interaction.service';
import { MouseHandler } from 'src/app/services/mouse-handler/mouse.handler';  

// Multi-purpose
const STROKE_WIDTH_REGEX = new RegExp(`stroke-width="([0-9.?]*)"`);
const STROKE_REGEX = new RegExp(`stroke="(#([0-9a-fA-F]{8})|none)"`);
const FILL_REGEX = new RegExp(`fill="(#([0-9a-fA-F]{8})|none)"`);

//Crayon
const POINTS_REGEX= new RegExp(`points="([0-9.?]+ [0-9.?]+(,[0-9.?]+ [0-9.?]+)*)`);

//Rect
const X_REGEX = new RegExp(`x="([-?0-9.?]*)"`);
const Y_REGEX = new RegExp(`y="([-?0-9.?]*)"`);
const WIDTH_REGEX = new RegExp(`width="([-?0-9.?]*)"`);
const HEIGHT_REGEX = new RegExp(`height="([-?0-9.?]*)"`);

//Ellipse
const CX_REGEX = new RegExp(`cx="([-?0-9.?]*)"`);
const CY_REGEX = new RegExp(`cy="([-?0-9.?]*)"`);
const RX_REGEX = new RegExp(`rx="([-?0-9.?]*)"`);
const RY_REGEX = new RegExp(`ry="([-?0-9.?]*)"`);

const TRANSLATE_REGEX = new RegExp(`transform="translate\(([-?0-9.?])+,([-?0-9.?])+\)"`);

@Component({
  selector: 'app-svg-view',
  templateUrl: './svg-view.component.html',
  styleUrls: ['./svg-view.component.scss']
})
export class SvgViewComponent implements OnInit, AfterViewInit {

  @ViewChild("canvas", {static:false}) canvas!: ElementRef;
  @ViewChild("drawingSpace", {static: false}) drawingSpace!: ElementRef;
  @ViewChild("actualDrawing", {static: false}) doneDrawing!: ElementRef;
  height!: number;
  width!: number;
  backColor: string = "#ffffff";
  toolsContainer = new Map();
  mouseHandler!: MouseHandler;
  contents: Map<number, SVGElement> = new Map();
  //temporary
  itemCounter: number = 0;

  constructor(
    private interactionService: InteractionService,
    private renderer: Renderer2,
    private canvBuilder: CanvasBuilderService,
    private colorPick: ColorPickingService
    ) { }

  ngOnInit(): void {
    this.initCanvas();
  }
  bgroundChangedSubscription(){
    
  }
  initCanvas() {
    this.canvBuilder.canvSubject.subscribe((canvas: Canvas) =>{
      if(canvas === undefined || canvas === null){
        canvas = this.canvBuilder.getDefCanvas();
      }

      this.width = canvas.canvasWidth;
      this.height = canvas.canvasHeight;
      this.backColor = canvas.canvasColor;
      if (canvas.wipeAll === true || canvas.wipeAll === undefined) { // if no attribute is specified, the doodle will be w
          this.canvBuilder.wipeDraw(this.doneDrawing);
      }
    });
    this.canvBuilder.emitCanvas();

    this.interactionService.$selectedTool.subscribe((tool: string) => {
      this.updateSelectedTool(tool);
    });

    
  }
  @HostListener('window:resize')
  onResize(){
    this.mouseHandler.updateWindowSize();
  }
  @HostListener('mousedown',['$event'])
  onMouseDown(e: MouseEvent){
    this.mouseHandler.down(e);
  }
  @HostListener('mouseup',['$event'])
  onMouseUp(e: MouseEvent){
    this.mouseHandler.up(e);
  }
  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent){
    this.mouseHandler.move(e);
  }
  @HostListener('wheel',['$event'])
  onWheel(e:WheelEvent){
    this.mouseHandler.wheel(e);
  }
  ngAfterViewInit(): void {
    // TODO; Use interactionService to unselect all the tools and select the tool chosen by the user
    if(this.canvas!== undefined){
      this.mouseHandler = new MouseHandler(this.canvas.nativeElement);
      this.createTools();

      // subscribe each tool to the mouse handler
      this.toolsContainer.forEach((element:InputObserver)=>{
        this.mouseHandler.addObserver(element);
      });
      this.bgroundChangedSubscription();
      this.interactionService.$drawing.subscribe((data:DrawingContent)=>{
        //console.log(data.drawing);
        if(this.drawingSpace!== undefined){
          //console.log(data)
          this.drawContent(data);
        }
        else{
          console.log("drawing space undefined");
        }
      })
    }
    else{
      console.log("canvas is undefined");
    }
  }

  // To create tools and add them to the map
  // A map is used instead of if/else
  createTools() {
    const pencil = new Pencil(true, this.interactionService, this.colorPick);
    const rectangle = new Rectangle(false, this.interactionService, this.colorPick);
    const ellipse = new Ellipse(false, this.interactionService, this.colorPick);
    const select = new Selection(
      false, 
      this.interactionService, 
      this.colorPick, 
      this.doneDrawing.nativeElement,
      this.canvas.nativeElement);

    this.toolsContainer.set('Crayon', pencil);
    this.toolsContainer.set('Rectangle', rectangle);
    this.toolsContainer.set('Ellipse', ellipse);
    this.toolsContainer.set('Sélectionner', select);
  }

  updateSelectedTool(tool: string) {
    if (tool) {
      // Unselect every tool which isn't tool
      this.toolsContainer.forEach((element) => {
        (element as DrawingTool).selected = false;
      })
      
      // Select tool
      this.toolsContainer.get(tool).selected = true;

      this.toolsContainer.forEach((element) => {
        if (element.selected) console.log(element)
      })
    }
  }

  // This method will be modified especially with the introduction of selected status and deleted status
  drawContent(data: DrawingContent){
    
    if(data.status === DrawingStatus.InProgress.valueOf()){
      if(!this.contents.has(data.contentId)){
        //new elements
        let newObj!: SVGElement;
        if (data.drawing.includes('polyline')) {
          newObj = this.createSVGPolyline(data.drawing);
        } else if (data.drawing.includes('rect')) {
          newObj = this.createSVGRect(data.drawing);
        } else if (data.drawing.includes('ellipse')) {
          newObj = this.createSVGEllipse(data.drawing);
        }
        
        if (newObj !== null) {
          this.renderer.appendChild(this.doneDrawing.nativeElement, newObj);
          this.contents.set(data.contentId, newObj);
        }
      }
      else {
        let element = this.contents.get(data.contentId)
        if (element !== undefined){
          if (data.drawing.includes('polyline')) {
            this.modifyPolyline(data.drawing, element);
          } else if (data.drawing.includes('rect')) {
            this.modifyRect(data.drawing, element);
          } else if (data.drawing.includes('ellipse')) {
            this.modifyEllipse(data.drawing, element);
         }
          this.renderer.appendChild(this.doneDrawing.nativeElement, element);
        }
      }
    }
    else if (data.status === DrawingStatus.Done.valueOf()){
      let element = this.contents.get(data.contentId)
      if (element!== undefined){
        this.renderer.removeChild(this.doneDrawing.nativeElement, element);
        if (data.drawing.includes('polyline')) {
          this.modifyPolyline(data.drawing, element);
        } else if (data.drawing.includes('rect')) {
          this.modifyRect(data.drawing, element);
        } else if (data.drawing.includes('ellipse')) {
          this.modifyEllipse(data.drawing, element);
        }
        this.renderer.appendChild(this.doneDrawing.nativeElement, element);
      }
    } else if (data.status === DrawingStatus.Selected.valueOf()) {
      //draw the box around the shape???
    }
  }
  
  createSVGPolyline(drawing: string){
    //console.log(drawing);
    let element = this.renderer.createElement('polyline', 'svg') as SVGPolylineElement;
    
    let points_array = POINTS_REGEX.exec(drawing);
    let stroke_width = STROKE_WIDTH_REGEX.exec(drawing);
    let stroke = STROKE_REGEX.exec(drawing);
    let fill = FILL_REGEX.exec(drawing);

    if (stroke)
      console.log(stroke[1].substring(0, 7));
    
    if (points_array !== null && stroke_width !== null && stroke !== null && fill !== null) {
      this.renderer.setAttribute(element, 'points', points_array[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString().substring(0, 7));
      this.renderer.setAttribute(element, 'stroke-width', stroke_width[1].toString());
      this.renderer.setAttribute(element, 'stroke-linecap', 'round');
      this.renderer.setAttribute(element, 'fill', fill[1].toString().substring(0, 7));
    }
    return element;
  }

  modifyPolyline(drawing: string, element: SVGElement) {
    this.renderer.removeAttribute(element, 'points');
    
    let points_array = POINTS_REGEX.exec(drawing);
    let stroke_width = STROKE_WIDTH_REGEX.exec(drawing);
    let stroke = STROKE_REGEX.exec(drawing);
    let fill = FILL_REGEX.exec(drawing);
    
    if (points_array !== null && stroke_width !== null && stroke !== null && fill !== null) {
      this.renderer.setAttribute(element, 'points', points_array[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString().substring(0, 7));
      this.renderer.setAttribute(element, 'stroke-width', stroke_width[1].toString());
      this.renderer.setAttribute(element, 'fill', fill[1].toString().substring(0, 7));
    }
  }

  createSVGRect(drawing: string) {
    let element = this.renderer.createElement('rect', 'svg') as SVGRectElement;
    
    let x = X_REGEX.exec(drawing);
    let y = Y_REGEX.exec(drawing);
    let width = WIDTH_REGEX.exec(drawing);
    let height = HEIGHT_REGEX.exec(drawing);
    let stroke_width = STROKE_WIDTH_REGEX.exec(drawing);
    let stroke = STROKE_REGEX.exec(drawing);
    let fill = FILL_REGEX.exec(drawing);
    
    if(x !== null && y !== null && width !== null && height !== null && stroke_width !== null && stroke !== null && fill !== null){
      this.renderer.setAttribute(element, 'x', x[1].toString());
      this.renderer.setAttribute(element, 'y', y[1].toString());
      this.renderer.setAttribute(element, 'width', width[1].toString());
      this.renderer.setAttribute(element, 'height', height[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString().substring(0, 7));
      this.renderer.setAttribute(element, 'stroke-width', stroke_width[1].toString());
      this.renderer.setAttribute(element, 'fill', fill[1].toString().substring(0, 7));
    }
    return element;
  }

  modifyRect(drawing: string, element: SVGElement){
    let x = X_REGEX.exec(drawing);
    let y = Y_REGEX.exec(drawing);
    let width = WIDTH_REGEX.exec(drawing);
    let height = HEIGHT_REGEX.exec(drawing);
    let stroke_width = STROKE_WIDTH_REGEX.exec(drawing);
    let stroke = STROKE_REGEX.exec(drawing);
    let fill = FILL_REGEX.exec(drawing);
    
    if (x !== null && y !== null && width !== null && height !== null && stroke_width !== null && stroke !== null && fill !== null) {
      this.renderer.setAttribute(element, 'x', x[1].toString());
      this.renderer.setAttribute(element, 'y', y[1].toString());
      this.renderer.setAttribute(element, 'width', width[1].toString());
      this.renderer.setAttribute(element, 'height', height[1].toString());
      this.renderer.setAttribute(element, 'stroke-width', stroke_width[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString().substring(0, 7));
      this.renderer.setAttribute(element, 'fill', fill[1].toString().substring(0, 7));
    }
  }

  createSVGEllipse(drawing: string) {
    //console.log(drawing);
    let element = this.renderer.createElement('ellipse', 'svg');
    
    let cx = CX_REGEX.exec(drawing);
    let cy = CY_REGEX.exec(drawing);
    let rx = RX_REGEX.exec(drawing);
    let ry = RY_REGEX.exec(drawing);
    let stroke_width = STROKE_WIDTH_REGEX.exec(drawing);
    let stroke = STROKE_REGEX.exec(drawing);
    let fill = FILL_REGEX.exec(drawing);
    
    if(cx !== null && cy !== null && rx !== null && ry !== null && stroke_width !== null && stroke !== null && fill !== null) {
      this.renderer.setAttribute(element, 'cx', cx[1].toString());
      this.renderer.setAttribute(element, 'cy', cy[1].toString());
      this.renderer.setAttribute(element, 'rx', rx[1].toString());
      this.renderer.setAttribute(element, 'ry', ry[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString().substring(0, 7));
      this.renderer.setAttribute(element, 'stroke-width', stroke_width[1].toString());
      this.renderer.setAttribute(element, 'fill', fill[1].toString().substring(0, 7));
    }
    return element;
  }

  modifyEllipse(drawing: string, element: SVGElement){
    let cx = CX_REGEX.exec(drawing);
    let cy = CY_REGEX.exec(drawing);
    let rx = RX_REGEX.exec(drawing);
    let ry = RY_REGEX.exec(drawing);
    let stroke_width = STROKE_WIDTH_REGEX.exec(drawing);
    let stroke = STROKE_REGEX.exec(drawing);
    let fill = FILL_REGEX.exec(drawing);
    
    if(cx !== null && cy !== null && rx !== null && ry !== null && stroke_width !== null && stroke !== null && fill !== null) {
      this.renderer.setAttribute(element, 'cx', cx[1].toString());
      this.renderer.setAttribute(element, 'cy', cy[1].toString());
      this.renderer.setAttribute(element, 'rx', rx[1].toString());
      this.renderer.setAttribute(element, 'ry', ry[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString().substring(0, 7));
      this.renderer.setAttribute(element, 'stroke-width', stroke_width[1].toString());
      this.renderer.setAttribute(element, 'fill', fill[1].toString().substring(0, 7));
    }
  }
}
