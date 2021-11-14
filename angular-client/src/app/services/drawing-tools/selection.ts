import { ElementRef, Renderer2 } from '@angular/core';
import { ColorPickingService } from '../color-picker/color-picking.service';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { InteractionService } from '../interaction/interaction.service';
import { SocketService } from '../socket/socket.service';
import { Pencil } from './pencil';
import { Rectangle } from './rectangle';
import { Ellipse } from './ellipse';

//const INIT_VALUE = -1;

export class Selection implements DrawingTool {

  currentX: number = 0.0;
  currentY: number=0.0;
  str: string= "";
  selected: boolean = false;;
  startTransformPoint: Point = new Point(0,0);
  totalTranslation: Point = new Point(0,0);
  totalScaling: Point = new Point(0,0);
  scalingPositions: Map<Point, Point> = new Map<Point, Point>();
  contentId!: number;
  userId: string;
  element!: SVGElement;
  drawingId!: number;
  toolFound: boolean = false;
  //mouseIsDown: boolean = false;
  selectedTool: DrawingTool | undefined;
  constructor(
    private toolsArray: Map<number,DrawingTool>,
    private socketSerice: SocketService,
    private colorPick: ColorPickingService,
    private renderer: Renderer2,
    private canvas: ElementRef,
    private interactionService: InteractionService,
    drawingId: number,
    //private drawingId: number,
    userId: string
    ) {
        this.drawingId = drawingId;
        this.userId = userId;
    }
    onMouseDown(event: MouseEvent): void {
        //throw new Error('Method not implemented.');
        /*let i = this.toolsArray.length -1;
        if(this.toolsArray.length > 0){
            while(i>= 0){
                let tool = this.toolsArray[i]
                if(tool.inTranslationZone(event)){
                    if(tool.userId === null || !(tool.selected && tool.userId !== this.userId)){
                        if(tool instanceof Pencil){
                            this.selectedTool = new Pencil(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas);
                        }
                        else if(tool instanceof Rectangle){
                            this.selectedTool = new Rectangle(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas);
                        }
                        else{
                            this.selectedTool = new Ellipse(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas)
                        }
                        this.selectedTool.drawingId = this.drawingId;
                        this.selectedTool.parse(tool.getOriginalString())
                        this.startTransformPoint.x = tool.startTransformPoint.x;
                        this.startTransformPoint.y  = tool.startTransformPoint.y;
                        this.selectedTool.contentId = tool.contentId;
                        this.selectedTool.select();
                    }
                    break;
                }
                i--;
            }
        }*/
        this.toolsArray.forEach((tool)=>{
            if(!this.toolFound && tool.inTranslationZone(event)){
                if(tool.userId === null || !(tool.selected && tool.userId !== this.userId)){
                    if(tool instanceof Pencil){
                        this.selectedTool = new Pencil(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas);
                    }
                    else if(tool instanceof Rectangle){
                        this.selectedTool = new Rectangle(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas);
                    }
                    else{
                        this.selectedTool = new Ellipse(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas)
                    }
                    this.selectedTool.drawingId = this.drawingId;
                    this.selectedTool.parse(tool.getOriginalString())
                    this.startTransformPoint.x = tool.startTransformPoint.x;
                    this.startTransformPoint.y  = tool.startTransformPoint.y;
                    this.selectedTool.contentId = tool.contentId;
                    this.selectedTool.select();
                    this.toolFound = true;
                }
                
            }
        })
    }
    onMouseUp(e: MouseEvent): void {
        //throw new Error('Method not implemented.');
        if(this.selectedTool!== undefined){
            this.selectedTool.onMouseUp(e);
        }
    }
    getSelectedTool():DrawingTool | undefined{
        return this.selectedTool;
    }
    onMouseMove(event: MouseEvent): void {
        throw new Error('Method not implemented.');
    }
    getString(): string {
        //throw new Error('Method not implemented.');
        return this.str;
    }
    getOriginalString(): string {
        //throw new Error('Method not implemented.');
        return this.str;
    }
    inTranslationZone(event: MouseEvent): boolean {
        if(this.selectedTool!== undefined){
            return this.selectedTool.inTranslationZone(event);
        }
        return false;
        //throw new Error('Method not implemented.');
    }
    translate(translationPoint: Point): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.translate(translationPoint);
        }
        //throw new Error('Method not implemented.');
    }
    scale(scalePoint: Point, direction: Point): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.scale(scalePoint, direction);
        }
        //throw new Error('Method not implemented.');
    }
    getSelectionString(): void {
        //throw new Error('Method not implemented.');
    }
    calculateScalingPositions(): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.calculateScalingPositions();
        }
        //throw new Error('Method not implemented.');
    }
    getScalingPoint(point: Point): [Point, Point] | null {
        if(this.selectedTool!== undefined){
            return this.selectedTool.getScalingPoint(point);
        }
        return null;
        //throw new Error('Method not implemented.');
    }
    getScalingPositionsString(): void {
        //throw new Error('Method not implemented.');
    }
    parse(parceableString: string): void {
        //throw new Error('Method not implemented.');
    }
    unselect(): void {
        //throw new Error('Method not implemented.');
        if(this.selectedTool!== undefined){
            this.selectedTool.unselect();
        }
    }
    delete(): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.delete();
            this.selectedTool = undefined;
        }
        //throw new Error('Method not implemented.');
    }
    updateThickness(): void {
        //throw new Error('Method not implemented.');
        if(this.selectedTool !== undefined){
            this.selectedTool.updateThickness();
        }
    }
    updatePrimaryColor(): void {
        //throw new Error('Method not implemented.');
        if(this.selectedTool !== undefined){
            this.selectedTool.updatePrimaryColor();
        }
    }
    updateSecondaryColor(): void {
        //throw new Error('Method not implemented.');
        if(this.selectedTool !== undefined){
            this.selectedTool.updateSecondaryColor();
        }
    }
    select(): void {
        //throw new Error('Method not implemented.');
    }
    setCriticalValues(): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.setCriticalValues();
        }
        //throw new Error('Method not implemented.');
    }
      
}
