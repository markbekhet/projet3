import { AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DrawingContent, DrawingStatus } from 'src/app/models/drawing-content';
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
  @ViewChild("actualDrawing", {static: false}) doneDrawing!:ElementRef;
  @ViewChild("inProgress", {static: false}) inProgress!: ElementRef
  height: number = 824;
  width: number = 1024;
  backColor: string = "#ffffff";
  toolsContainer = new Map();
  mouseHandler!: MouseHandler;
  constructor(private interactionService: InteractionService, private renderer: Renderer2) { }

  ngOnInit(): void {
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
    if(this.canvas!== undefined){
      this.mouseHandler = new MouseHandler(this.canvas.nativeElement);
      this.createTools();

      // subscribe each tool to the mouse handler
      this.toolsContainer.forEach((element:InputObserver)=>{
        this.mouseHandler.addObserver(element);
      });
      this.interactionService.$drawing.subscribe((data:DrawingContent)=>{
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
  createTools(){
    const pencil = new Pencil(true, this.interactionService);
    this.toolsContainer.set('pencil', pencil);
  }

  // This method will be modified especially with the introduction of selected status and deleted status
  drawContent(data: DrawingContent){
    if(data.status === DrawingStatus.InProgress){
      this.inProgress.nativeElement.innerHTML += data.drawing;
    }
    else if(data.status === DrawingStatus.Done){
      this.doneDrawing.nativeElement.innerHTML += data.drawing;
      const children: HTMLCollection = this.inProgress.nativeElement.children;
      for(let i= 0; i< children.length; i++){
        if(children[i].getAttribute('id') === data.contentId.toString()){
          this.renderer.removeChild(this.inProgress.nativeElement, children[i]);
        }
      }
    }
  }
}
