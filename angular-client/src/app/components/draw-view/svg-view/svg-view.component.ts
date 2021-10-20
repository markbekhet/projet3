import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DrawingContent } from 'src/app/models/drawing-content';
import { InputObserver } from 'src/app/services/draw-tool/input-observer';
import { Pencil } from 'src/app/services/draw-tool/pencil';
import { InteractionService } from 'src/app/services/interaction-service/interaction.service';
import { MouseHandler } from 'src/app/services/mouse-handler/mouse.handler';

@Component({
  selector: 'app-svg-view',
  templateUrl: './svg-view.component.html',
  styleUrls: ['./svg-view.component.scss']
})
export class SvgViewComponent implements OnInit, AfterViewInit {

  @ViewChild("canvas", {static:false}) canvas: ElementRef| undefined;
  @ViewChild("drawingSpace", { static: false })
  drawingSpace: ElementRef| undefined;
  @ViewChild("actualDrawing", {static: false}) currentDrawing!:ElementRef;
  height: number = 824;
  width: number = 1024;
  backColor: string = "#ffffff";
  toolsContainer = new Map();
  constructor(private interactionService: InteractionService, private renderer: Renderer2) { }

  ngOnInit(): void {
  }
  /*@HostListener('mousedown',['$event'])
  onMouseDown(e: MouseEvent){

  }*/
  ngAfterViewInit(): void {
    if(this.canvas!== undefined){
      const mouseHandler = new MouseHandler(this.canvas.nativeElement);
      this.createTools();

      // subscribe each tool to the mouse handler
      this.toolsContainer.forEach((element:InputObserver)=>{
        mouseHandler.addObserver(element);
      });
      window.addEventListener('mousemove', (e: MouseEvent) => {
        mouseHandler.move(e);
      });
      window.addEventListener('mousedown', (e: MouseEvent) => {
          // e.preventDefault();
          mouseHandler.down(e);
      });

      window.addEventListener('mouseup', (e: MouseEvent) => {
          mouseHandler.up(e);
      });
      window.addEventListener('wheel', (e: WheelEvent) => {
          mouseHandler.wheel(e);
      });
      this.interactionService.$drawing.subscribe((drawing:DrawingContent)=>{
        if(this.drawingSpace!== undefined){
          console.log(drawing)
          this.currentDrawing.nativeElement.innerHTML = drawing.drawing;
          console.log(this.currentDrawing.nativeElement.innerHTML);
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
  createTools(){
    const pencil = new Pencil(true, this.interactionService);
    this.toolsContainer.set('pencil', pencil);
  }
}
