/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { DrawingContent, DrawingStatus } from '@models/DrawingMeta';

import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { DrawingTool } from '@services/drawing-tools/drawing-tool';
import { Ellipse } from '@services/drawing-tools/ellipse';
import { InputObserver } from '@services/drawing-tools/input-observer';
import { InteractionService } from '@services/interaction/interaction.service';
import { MouseHandler } from '@services/mouse-handler/mouse-handler';
import { Pencil } from '@services/drawing-tools/pencil';
import { Rectangle } from '@services/drawing-tools/rectangle';
import { SocketService } from '@src/app/services/socket/socket.service';
import { DrawingInformations } from '@src/app/models/drawing-informations';
import { ActiveDrawing } from '@src/app/services/static-services/user_token';
import { Selection } from 'src/app/services/drawing-tools/selection';
import { DrawingService } from '@src/app/services/drawing/drawing.service';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { ELLIPSE_TOOL_NAME, PENCIL_TOOL_NAME, RECT_TOOL_NAME } from '@src/app/services/drawing-tools/tool-names';


// Multi-purpose
const STROKE_WIDTH_REGEX = new RegExp(`stroke-width="([0-9.?]*)"`);
const STROKE_REGEX = new RegExp(`stroke="(#([0-9a-fA-F]{8})|none)"`);
const FILL_REGEX = new RegExp(`fill="(#([0-9a-fA-F]{8})|none)"`);

// Crayon
const POINTS_REGEX = new RegExp(
  `points="([0-9.?]+ [0-9.?]+(,[0-9.?]+ [0-9.?]+)*)`
);

// Rectangle
const X_REGEX = new RegExp(`x="([-?0-9.?]*)"`);
const Y_REGEX = new RegExp(`y="([-?0-9.?]*)"`);
const WIDTH_REGEX = new RegExp(`width="([-?0-9.?]*)"`);
const HEIGHT_REGEX = new RegExp(`height="([-?0-9.?]*)"`);

// Ellipse
const CX_REGEX = new RegExp(`cx="([-?0-9.?]*)"`);
const CY_REGEX = new RegExp(`cy="([-?0-9.?]*)"`);
const RX_REGEX = new RegExp(`rx="([-?0-9.?]*)"`);
const RY_REGEX = new RegExp(`ry="([-?0-9.?]*)"`);

//const TRANSLATE_REGEX = new RegExp(`transform="translate\(([-?0-9.?])+,([-?0-9.?])+\)"`);

@Component({
  selector: 'app-svg-view',
  templateUrl: './svg-view.component.html',
  styleUrls: ['./svg-view.component.scss'],
})
export class SvgViewComponent implements OnInit, AfterViewInit {
  @ViewChild("canvas", {static:false}) canvas!: ElementRef;
  @ViewChild("drawingSpace", {static: false}) drawingSpace!: ElementRef;
  @ViewChild("actualDrawing", {static: false}) doneDrawing!: ElementRef;
  
  height!: number;
  width!: number;
  backColor: string = '#FFFFFF';
  toolsContainer = new Map();
  mouseHandler!: MouseHandler;
  contents: Map<number, SVGElement> = new Map();
  // temporary
  itemCounter: number = 0;

  constructor(
    private interactionService: InteractionService,
    private renderer: Renderer2,
    //private canvBuilder: CanvasBuilderService,
    private colorPick: ColorPickingService,
    private readonly socketService: SocketService,
    private readonly drawingService: DrawingService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.initDrawing();
  }

  initDrawing(){
    this.socketService.getDrawingInformations().subscribe((drawingInformations: DrawingInformations)=>{
      this.backColor = "#"+ drawingInformations.drawing.bgColor;
      this.width = drawingInformations.drawing.width;
      this.height = drawingInformations.drawing.height;
      this.drawingService.drawingName.next(drawingInformations.drawing.name);
      ActiveDrawing.drawingName = drawingInformations.drawing.name;
      if(drawingInformations.drawing.contents.length > 0){
        for(let content of drawingInformations.drawing.contents){
          if(content.content!== null && content.content!== undefined){
            this.drawExistingContent(content);
          }
        }
      }
    });
  }
  
  @HostListener('window:resize')
  onResize() {
    this.mouseHandler.updateWindowSize();
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    this.mouseHandler.down(e);
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(e: MouseEvent) {
    this.mouseHandler.up(e);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouseHandler.move(e);
  }

  @HostListener('wheel', ['$event'])
  onWheel(e: WheelEvent) {
    this.mouseHandler.wheel(e);
  }

  ngAfterViewInit(): void {
    // TODO; Use interactionService to unselect all the tools and select the tool chosen by the user
    if (this.canvas !== undefined) {
      this.mouseHandler = new MouseHandler(this.canvas.nativeElement);
      this.createTools();

      // subscribe each tool to the mouse handler
      this.toolsContainer.forEach((element: InputObserver) => {
        this.mouseHandler.addObserver(element);
      });
      /*this.interactionService.$drawing.subscribe((data: DrawingContent) => {
        // console.log(data.drawing);
        if (this.drawingSpace !== undefined) {
          // console.log(data)
          this.drawContent(data);
        } else {
          console.log('drawing space undefined');
        }
      });*/
      this.interactionService.$selectedTool.subscribe((toolName: string)=>{
        this.updateSelectedTool(toolName);
      })
      this.socketService.getDrawingContent().subscribe((data: DrawingContent)=>{
        if(this.drawingSpace !== undefined){
          this.drawContent(data);
        }
      })
    } 
    else {
      console.log('canvas is undefined');
    }
  }

  // To create tools and add them to the map
  // A map is used instead of if/else
  createTools() {
    const pencil = new Pencil(true, this.interactionService, this.colorPick, this.socketService, this.drawingService, this.authService);
    const rectangle = new Rectangle(
      false,
      this.interactionService,
      this.colorPick,
      this.socketService,
      this.drawingService,
      this.authService
    );
    const ellipse = new Ellipse(false, this.interactionService, this.colorPick, this.socketService, this.drawingService, this.authService);
    const select = new Selection(
      false, 
      this.interactionService, 
      this.colorPick, 
      this.doneDrawing.nativeElement,
      this.canvas.nativeElement, this.socketService,
      this.drawingService,
      this.authService);


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
      });

      // Select tool
      this.toolsContainer.get(tool).selected = true;

      this.toolsContainer.forEach((element) => {
        if (element.selected) console.log(element);
      });
    }
  }
  drawExistingContent(data: DrawingContent){
    let newObj!: SVGElement;
    if (data.content.includes('polyline')) {
      console.log(`pencil: ${data.content}`);
      newObj = this.createSVGPolyline(data.content);
    } else if (data.content.includes('rect')) {
      console.log(`rect: ${data.content}`);
      newObj = this.createSVGRect(data.content);
    } else if (data.content.includes('ellipse')) {
      console.log(`ell: ${data.id}`);
      newObj = this.createSVGEllipse(data.content);
    }

    if (newObj !== null) {
      this.renderer.appendChild(this.doneDrawing.nativeElement, newObj);
      this.contents.set(data.id, newObj);
    }
  }
  // This method will be modified especially with the introduction of selected status and deleted status
  drawContent(data: DrawingContent) {
    console.log(data);
    console.log(data.toolName === RECT_TOOL_NAME)
    if (data.status === DrawingStatus.InProgress.valueOf()) {
      if (!this.contents.has(data.id)) {
        // new elements
        let newObj!: SVGElement;
        if (data.toolName.includes(PENCIL_TOOL_NAME)) {
          console.log(`pencil: ${data.content}`);
          newObj = this.createSVGPolyline(data.content);
        } else if (data.toolName.includes(RECT_TOOL_NAME)) {
          console.log(`rect: ${data.content}`);
          newObj = this.createSVGRect(data.content);
        } else if (data.toolName.includes(ELLIPSE_TOOL_NAME)) {
          console.log(`ell: ${data.id}`);
          newObj = this.createSVGEllipse(data.content);
        }

        if (newObj !== null) {
          this.renderer.appendChild(this.doneDrawing.nativeElement, newObj);
          this.contents.set(data.id, newObj);
        }
      } else {
        const element = this.contents.get(data.id);
        if (element !== undefined) {
          // this.renderer.removeChild(this.inProgress.nativeElement,element);
          if (data.toolName.includes(PENCIL_TOOL_NAME)) {
            this.modifyPolyline(data.content, element);
          } else if (data.toolName.includes(RECT_TOOL_NAME)) {
            this.modifyRect(data.content, element);
          } else if (data.toolName.includes(ELLIPSE_TOOL_NAME)) {
            this.modifyEllipse(data.content, element);
            // console.log(data.drawing);
          }
          this.renderer.appendChild(this.doneDrawing.nativeElement, element);
        }
      }
    } else if (data.status === DrawingStatus.Done.valueOf()) {
      const element = this.contents.get(data.id);
      if (element !== undefined) {
        this.renderer.removeChild(this.doneDrawing.nativeElement, element);
        if (data.toolName.includes(PENCIL_TOOL_NAME)) {
          this.modifyPolyline(data.content, element);
        } else if (data.toolName.includes(RECT_TOOL_NAME)) {
          this.modifyRect(data.content, element);
        } else if (data.toolName.includes(ELLIPSE_TOOL_NAME)) {
          this.modifyEllipse(data.content, element);
        }
        this.renderer.appendChild(this.doneDrawing.nativeElement, element);
      }
    }
  }

  createSVGPolyline(drawing: string) {
    // console.log(drawing);
    const element = this.renderer.createElement(
      'polyline',
      'svg'
    ) as SVGPolylineElement;

    const pointsArray = POINTS_REGEX.exec(drawing);
    const strokeWidth = STROKE_WIDTH_REGEX.exec(drawing);
    const stroke = STROKE_REGEX.exec(drawing);
    const fill = FILL_REGEX.exec(drawing);

    if (
      pointsArray !== null &&
      strokeWidth !== null &&
      stroke !== null &&
      fill !== null
    ) {
      this.renderer.setAttribute(element, 'points', pointsArray[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString());
      this.renderer.setAttribute(
        element,
        'stroke-width',
        strokeWidth[1].toString()
      );
      this.renderer.setAttribute(element, 'stroke-linecap', 'round');
      this.renderer.setAttribute(element, 'fill', fill[1].toString());
    }
    return element;
  }

  modifyPolyline(drawing: string, element: SVGElement) {
    this.renderer.removeAttribute(element, 'points');

    const pointsArray = POINTS_REGEX.exec(drawing);
    const strokeWidth = STROKE_WIDTH_REGEX.exec(drawing);
    const stroke = STROKE_REGEX.exec(drawing);
    const fill = FILL_REGEX.exec(drawing);

    if (
      pointsArray !== null &&
      strokeWidth !== null &&
      stroke !== null &&
      fill !== null
    ) {
      this.renderer.setAttribute(element, 'points', pointsArray[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString());
      this.renderer.setAttribute(
        element,
        'stroke-width',
        strokeWidth[1].toString()
      );
      this.renderer.setAttribute(element, 'fill', fill[1].toString());
    }
  }

  createSVGRect(drawing: string) {
    const element = this.renderer.createElement(
      'rect',
      'svg'
    ) as SVGRectElement;

    const x = X_REGEX.exec(drawing);
    const y = Y_REGEX.exec(drawing);
    const width = WIDTH_REGEX.exec(drawing);
    const height = HEIGHT_REGEX.exec(drawing);
    const strokeWidth = STROKE_WIDTH_REGEX.exec(drawing);
    const stroke = STROKE_REGEX.exec(drawing);
    const fill = FILL_REGEX.exec(drawing);

    if (
      x !== null &&
      y !== null &&
      width !== null &&
      height !== null &&
      strokeWidth !== null &&
      stroke !== null &&
      fill !== null
    ) {
      this.renderer.setAttribute(element, 'x', x[1].toString());
      this.renderer.setAttribute(element, 'y', y[1].toString());
      this.renderer.setAttribute(element, 'width', width[1].toString());
      this.renderer.setAttribute(element, 'height', height[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString());
      this.renderer.setAttribute(
        element,
        'stroke-width',
        strokeWidth[1].toString()
      );
      this.renderer.setAttribute(element, 'fill', fill[1].toString());
    }
    return element;
  }

  modifyRect(drawing: string, element: SVGElement) {
    const x = X_REGEX.exec(drawing);
    const y = Y_REGEX.exec(drawing);
    const width = WIDTH_REGEX.exec(drawing);
    const height = HEIGHT_REGEX.exec(drawing);
    const strokeWidth = STROKE_WIDTH_REGEX.exec(drawing);
    const stroke = STROKE_REGEX.exec(drawing);
    const fill = FILL_REGEX.exec(drawing);

    if (
      x !== null &&
      y !== null &&
      width !== null &&
      height !== null &&
      strokeWidth !== null &&
      stroke !== null &&
      fill !== null
    ) {
      this.renderer.setAttribute(element, 'x', x[1].toString());
      this.renderer.setAttribute(element, 'y', y[1].toString());
      this.renderer.setAttribute(element, 'width', width[1].toString());
      this.renderer.setAttribute(element, 'height', height[1].toString());
      this.renderer.setAttribute(
        element,
        'stroke-width',
        strokeWidth[1].toString()
      );
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString());
      this.renderer.setAttribute(element, 'fill', fill[1].toString());
    }
  }

  createSVGEllipse(drawing: string) {
    // console.log(drawing);
    const element = this.renderer.createElement('ellipse', 'svg');

    const cx = CX_REGEX.exec(drawing);
    const cy = CY_REGEX.exec(drawing);
    const rx = RX_REGEX.exec(drawing);
    const ry = RY_REGEX.exec(drawing);
    const strokeWidth = STROKE_WIDTH_REGEX.exec(drawing);
    const stroke = STROKE_REGEX.exec(drawing);
    const fill = FILL_REGEX.exec(drawing);
    if (stroke)
      console.log(`element: ${drawing}\nstroke: ${stroke[1].substring(0, 7)}`);

    if (
      cx !== null &&
      cy !== null &&
      rx !== null &&
      ry !== null &&
      strokeWidth !== null &&
      stroke !== null &&
      fill !== null
    ) {
      this.renderer.setAttribute(element, 'cx', cx[1].toString());
      this.renderer.setAttribute(element, 'cy', cy[1].toString());
      this.renderer.setAttribute(element, 'rx', rx[1].toString());
      this.renderer.setAttribute(element, 'ry', ry[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString());
      this.renderer.setAttribute(
        element,
        'stroke-width',
        strokeWidth[1].toString()
      );
      this.renderer.setAttribute(element, 'fill', fill[1].toString());
    }
    return element;
  }

  modifyEllipse(drawing: string, element: SVGElement) {
    const cx = CX_REGEX.exec(drawing);
    const cy = CY_REGEX.exec(drawing);
    const rx = RX_REGEX.exec(drawing);
    const ry = RY_REGEX.exec(drawing);
    const strokeWidth = STROKE_WIDTH_REGEX.exec(drawing);
    const stroke = STROKE_REGEX.exec(drawing);
    const fill = FILL_REGEX.exec(drawing);

    if (
      cx !== null &&
      cy !== null &&
      rx !== null &&
      ry !== null &&
      strokeWidth !== null &&
      stroke !== null &&
      fill !== null
    ) {
      this.renderer.setAttribute(element, 'cx', cx[1].toString());
      this.renderer.setAttribute(element, 'cy', cy[1].toString());
      this.renderer.setAttribute(element, 'rx', rx[1].toString());
      this.renderer.setAttribute(element, 'ry', ry[1].toString());
      this.renderer.setAttribute(element, 'stroke', stroke[1].toString());
      this.renderer.setAttribute(
        element,
        'stroke-width',
        strokeWidth[1].toString()
      );
      this.renderer.setAttribute(element, 'fill', fill[1].toString());
    }
  }
}
