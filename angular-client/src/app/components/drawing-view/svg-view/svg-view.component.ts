/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  //Renderer2,
  ViewChild,
} from '@angular/core';

import { DrawingContent, DrawingStatus } from '@models/DrawingMeta';

import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { DrawingTool } from '@services/drawing-tools/drawing-tool';
//import { Ellipse } from '@services/drawing-tools/ellipse';
//import { InputObserver } from '@services/drawing-tools/input-observer';
import { InteractionService } from '@services/interaction/interaction.service';
//import { MouseHandler } from '@services/mouse-handler/mouse-handler';
import { Pencil } from '@services/drawing-tools/pencil';
//import { Rectangle } from '@services/drawing-tools/rectangle';
import { SocketService } from '@src/app/services/socket/socket.service';
import { DrawingInformations } from '@src/app/models/drawing-informations';
import { ActiveDrawing } from '@src/app/services/static-services/user_token';
//import { Selection } from 'src/app/services/drawing-tools/selection';
import { DrawingService } from '@src/app/services/drawing/drawing.service';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { ELLIPSE_TOOL_NAME, PENCIL_TOOL_NAME, RECT_TOOL_NAME } from '@src/app/services/drawing-tools/tool-names';
import { User } from '@src/app/models/UserMeta';
import { Point } from '@src/app/services/drawing-tools/point';
//import { ToolboxViewComponent } from '../toolbox-view/toolbox-view.component';
import { Renderer2 } from '@angular/core';

// Multi-purpose
/*const STROKE_WIDTH_REGEX = new RegExp(`stroke-width="([0-9.?]*)"`);
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
const RY_REGEX = new RegExp(`ry="([-?0-9.?]*)"`);*/

//const TRANSLATE_REGEX = new RegExp(`transform="translate\(([-?0-9.?])+,([-?0-9.?])+\)"`);
const PENCIL_COMP_TOOL_NAME = 'Crayon';
const RECT_COMP_TOOL_NAME = 'Rectangle';
const ELLIPSE_COMP_TOOL_NAME = 'Ellipse';
const SELECT_COMP_TOOL_NAME = 'Sélectionner';
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

  currentTool!: DrawingTool;
  toolsList: DrawingTool[];
  currentToolName = PENCIL_COMP_TOOL_NAME;
  drawingId!: number;
  userId!: string;
  scalingPoint: [Point, Point] | null | undefined
  mode: string = "";
  totalScaling: Point = new Point(0.0, 0.0);
  constructor(
    private interactionService: InteractionService,
    private renderer: Renderer2,
    //private canvBuilder: CanvasBuilderService,
    private colorPick: ColorPickingService,
    private readonly socketService: SocketService,
    private readonly drawingService: DrawingService,
    private readonly authService: AuthService,
  ) {
    //this.currentTool = new Pencil(this.interactionService, this.colorPick, this.socketService, this.drawingId, this.userId, this.renderer);
    this.toolsList = []
    this.currentToolName = PENCIL_COMP_TOOL_NAME;
    console.log(this.currentToolName);
    //this.getUserId()
    this.getDrawingId();
  }

  getUserId(){
    this.authService.authentifiedUser.subscribe((user: User)=>{
      this.userId = user.id;
    })
  }
  getDrawingId(){
    this.drawingService.drawingId.subscribe((id: number)=>{
      this.drawingId = id
    })
  }
  ngOnInit(): void {
    this.authService.authentifiedUser.subscribe((user: User)=>{
      this.userId = user.id;
    })
    
    this.initDrawing();
  }

  initDrawing(){
    this.toolsList =[]
    this.socketService.getDrawingInformations().subscribe((drawingInformations: DrawingInformations)=>{
      this.backColor = "#"+ drawingInformations.drawing.bgColor;
      this.width = drawingInformations.drawing.width;
      this.height = drawingInformations.drawing.height;
      this.drawingService.drawingName.next(drawingInformations.drawing.name);
      ActiveDrawing.drawingName = drawingInformations.drawing.name;
      drawingInformations.drawing.contents.forEach((content) => {
        if(content.content!== null && content.content!== undefined){
          this.manipulateReceivedDrawing(content);
        }        
      });
      this.draw();
      /*if(drawingInformations.drawing.contents.length > 0){
        for(let content of drawingInformations.drawing.contents){
          if(content.content!== null && content.content!== undefined){
            //this.drawExistingContent(content);
          }
        }
      }*/
    });
  }
  
  @HostListener('window:resize')
  onResize() {
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    console.log(this.currentToolName);
    if(this.currentTool !== undefined){
      this.scalingPoint = this.currentTool.getScalingPoint(new Point(e.x, e.y));
    }
    if(this.scalingPoint !== null && this.scalingPoint!==undefined){
      this.mode = "scaling";
      console.log(this.mode)
    }
    else if(this.isInsideTheSelection(e)){
      this.mode = "translation";
      console.log(this.mode)
    }
    else{
      console.log("else statement")
      if(this.currentTool!== undefined && this.currentTool!== null){
        this.currentTool.unselect()
      }
      if(this.currentToolName === PENCIL_COMP_TOOL_NAME.valueOf()){
        console.log("here");
        this.currentTool = new Pencil(this.interactionService, this.colorPick, this.socketService, this.userId, this.renderer, this.canvas);
        this.currentTool.drawingId = this.drawingId;
      }
      else if(this.currentToolName === RECT_COMP_TOOL_NAME.valueOf()){
        //TODO
      }
      else if(this.currentToolName === ELLIPSE_COMP_TOOL_NAME.valueOf()){
        // TODO
      }
      else if(this.currentToolName === SELECT_COMP_TOOL_NAME){
        // TODO
      }
      this.currentTool.onMouseDown(e)
      this.mode = ""
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(e: MouseEvent) {
    if(this.currentTool!== undefined && this.currentTool !== null){
      this.currentTool.onMouseUp(e);
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    // TODO
    if(this.currentTool!== undefined && this.currentTool !== null){
      this.currentTool.onMouseMove(e)
    }
  }

  ngAfterViewInit(): void {
    // TODO; Use interactionService to unselect all the tools and select the tool chosen by the user
    if (this.canvas !== undefined) {
      this.interactionService.$selectedTool.subscribe((toolName: string)=>{
        if(toolName) this.currentToolName = toolName;
      })
      this.drawingService.drawingId.subscribe((id: number)=>{
        this.drawingId = id
      })
      console.log(this.drawingId);
      
      
      this.socketService.getDrawingContentId().subscribe((data:{contentId: number})=>{
        this.currentTool.contentId = data.contentId;
      })
      this.socketService.getDrawingContent().subscribe((data: DrawingContent)=>{
        console.log('here receiving')
        if(this.drawingSpace !== undefined){
          //this.drawContent(data);
          this.manipulateReceivedDrawing(data);
          this.draw();
        }
      })
    } 
    else {
      console.log('canvas is undefined');
    }
  }
  draw() {
    //throw new Error('Method not implemented.');
    this.doneDrawing.nativeElement.innerHTML = "";
    this.toolsList.forEach((tool: DrawingTool)=>{
      console.log('hey')
      this.doneDrawing.nativeElement.innerHTML += tool.getString();
    })
      //this.doneDrawing.nativeElement.innerHTML += this.toolsList[i].getString();
  }

  manipulateReceivedDrawing(drawingContent: DrawingContent){
    //let i = 0;
    let exist = false;
    this.toolsList.forEach((tool)=>{
      if(tool.contentId === drawingContent.id){
        try{
          tool.parse(drawingContent.content);
        }catch(e){}
        exist = true;
        tool.selected = drawingContent.status === DrawingStatus.Selected;
        tool.userId = drawingContent.userId;
        if(drawingContent.status === DrawingStatus.Deleted){
          let index = this.toolsList.indexOf(tool);
          if(index !== -1)
            this.toolsList.splice(index,1);
          //this.renderer.removeChild(this.doneDrawing.nativeElement, tool.element);
        }
      }
    })

    if(!exist){
      try{
        let newTool!: DrawingTool;
        switch(drawingContent.toolName){
          case PENCIL_TOOL_NAME:
            newTool = new Pencil(this.interactionService, this.colorPick, this.socketService, this.userId, this.renderer, this.canvas);
            break;
          
          case RECT_TOOL_NAME:
            //TODO
            break;
          case ELLIPSE_TOOL_NAME:
            //TODO
            break;
          default:
            break;
        }
        newTool.userId = drawingContent.userId;
        newTool.contentId = drawingContent.id;
        newTool.selected = drawingContent.status === DrawingStatus.Selected;
        newTool.parse(drawingContent.content);
        //this.renderer.appendChild(this.doneDrawing.nativeElement, newTool.element);
        this.toolsList.push(newTool);
      }catch(err){
        //console.log(err.message)
      }
    }
  }
  // To create tools and add them to the map
  // A map is used instead of if/else
  /*createTools() {
    const pencil = new Pencil(this.interactionService, this.colorPick, this.socketService, this.drawingService, this.authService);
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
  }*/

  /*updateSelectedTool(tool: string) {
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
  }*/
  /*drawExistingContent(data: DrawingContent){
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
  }*/
  // This method will be modified especially with the introduction of selected status and deleted status
  /*drawContent(data: DrawingContent) {
    debugger
    console.log(`drawing content: ${data.content}, drawing tool: ${data.toolName}`)
    if (data.status === DrawingStatus.InProgress.valueOf()) {
      if (!this.contents.has(data.id)) {
        // new elements
        let newObj!: SVGElement;
        if (data.toolName === PENCIL_TOOL_NAME) {
          console.log(`pencil: ${data.content}`);
          newObj = this.createSVGPolyline(data.content);
        } else if (data.toolName === RECT_TOOL_NAME) {
          console.log(`rect: ${data.content}`);
          newObj = this.createSVGRect(data.content);
        } else if (data.toolName === ELLIPSE_TOOL_NAME) {
          console.log(`ell: ${data.content}`);
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
          if (data.toolName === PENCIL_TOOL_NAME) {
            this.modifyPolyline(data.content, element);
          } else if (data.toolName === RECT_TOOL_NAME) {
            console.log(`rect: ${data.content}`);
            this.modifyRect(data.content, element);
          } else if (data.toolName === ELLIPSE_TOOL_NAME) {
            console.log(`ell: ${data.content}`);
            this.modifyEllipse(data.content, element);
            // console.log(data.drawing);
          }
          //this.renderer.appendChild(this.doneDrawing.nativeElement, element);
        }
      }
    } else if (data.status === DrawingStatus.Done.valueOf()) {
      const element = this.contents.get(data.id);
      if (element !== undefined) {
        //this.renderer.removeChild(this.doneDrawing.nativeElement, element);
        if (data.toolName === PENCIL_TOOL_NAME) {
          this.modifyPolyline(data.content, element);
        } else if (data.toolName === RECT_TOOL_NAME) {
          console.log(`rect: ${data.content}`);
          this.modifyRect(data.content, element);
        } else if (data.toolName === ELLIPSE_TOOL_NAME) {
          console.log(`ell: ${data.content}`);
          this.modifyEllipse(data.content, element);
        }
        //this.renderer.appendChild(this.doneDrawing.nativeElement, element);
      }
    }
  }


  createSVGPolyline(drawing: string) {
    // console.log(drawing);
    console.log('here pencil')
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
    console.log('here modifying pencil')
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
    console.log('here');
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
    
    console.log(`x: ${x}, y: ${y}, width: ${width}`);
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
  }*/
  isInsideTheSelection(e: MouseEvent): boolean {
    //throw new Error('Function not implemented.');
    if(this.currentTool !== undefined && this.currentTool.inTranslationZone(e)){
      return true;
    }
    return false
  }
}

