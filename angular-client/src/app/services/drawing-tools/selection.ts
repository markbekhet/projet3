import { ElementRef, Renderer2 } from '@angular/core';
import { ColorPickingService } from '../color-picker/color-picking.service';
import { DrawingTool } from './drawing-tool';
import { Point } from './point';
import { InteractionService } from '../interaction/interaction.service';
import { SocketService } from '../socket/socket.service';
import { Pencil } from './pencil';
import { Rectangle } from './rectangle';
import { Ellipse } from './ellipse';
import { DrawingService } from '../drawing/drawing.service';

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
    public toolsArray: Map<number,DrawingTool>,
    private socketSerice: SocketService,
    private colorPick: ColorPickingService,
    private renderer: Renderer2,
    private canvas: ElementRef,
    private interactionService: InteractionService,
    drawingId: number,
    //private drawingId: number,
    userId: string,
    private drawingService: DrawingService,
    ) {
        this.drawingId = drawingId;
        this.userId = userId;
    }
    onMouseDown(event: MouseEvent): void {
        this.toolsArray.forEach((tool: DrawingTool)=>{
            if(!this.toolFound && tool.inTranslationZone(event)){
                if(tool.userId === null || !(tool.selected && tool.userId !== this.userId)){
                    if(tool instanceof Pencil){
                        this.selectedTool = new Pencil(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas, this.drawingService);
                    }
                    else if(tool instanceof Rectangle){
                        this.selectedTool = new Rectangle(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas, this.drawingService);
                    }
                    else{
                        this.selectedTool = new Ellipse(this.interactionService, this.colorPick, this.socketSerice, this.userId, this.renderer, this.canvas, this.drawingService)
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
        if(this.selectedTool!== undefined){
            this.selectedTool.onMouseUp(e);
        }
    }
    getSelectedTool():DrawingTool | undefined{
        return this.selectedTool;
    }
    onMouseMove(event: MouseEvent): void {
    }
    getString(): string {

        return this.str;
    }
    getOriginalString(): string {

        return this.str;
    }
    inTranslationZone(event: MouseEvent): boolean {
        if(this.selectedTool!== undefined){
            return this.selectedTool.inTranslationZone(event);
        }
        return false;

    }
    translate(translationPoint: Point): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.translate(translationPoint);
        }

    }
    scale(scalePoint: Point, direction: Point): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.scale(scalePoint, direction);
        }

    }
    getSelectionString(): void {

    }
    calculateScalingPositions(): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.calculateScalingPositions();
        }
 
    }
    getScalingPoint(point: Point): [Point, Point] | null {
        if(this.selectedTool!== undefined){
            return this.selectedTool.getScalingPoint(point);
        }
        return null;

    }
    getScalingPositionsString(): void {

    }
    parse(parceableString: string): void {
  
    }
    unselect(): void {
 
        if(this.selectedTool!== undefined){
            this.selectedTool.unselect();
        }
    }
    delete(): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.delete();
            this.selectedTool = undefined;
        }

    }
    updateThickness(): void {
 
        if(this.selectedTool !== undefined){
            this.selectedTool.updateThickness();
        }
    }
    updatePrimaryColor(): void {

        if(this.selectedTool !== undefined){
            this.selectedTool.updatePrimaryColor();
        }
    }
    updateSecondaryColor(): void {

        if(this.selectedTool !== undefined){
            this.selectedTool.updateSecondaryColor();
        }
    }
    select(): void {

    }
    setCriticalValues(): void {
        if(this.selectedTool!== undefined){
            this.selectedTool.setCriticalValues();
        }

    }
      
}
