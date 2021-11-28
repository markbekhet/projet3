


/* eslint-disable no-case-declarations */
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
// import { DrawingInformations } from '@models/drawing-informations';
// import { User } from '@models/UserMeta';

import { AuthService } from '@services/authentication/auth.service';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { DrawingService } from '@services/drawing/drawing.service';
import { DrawingTool } from '@services/drawing-tools/drawing-tool';
import { Ellipse } from '@services/drawing-tools/ellipse';
import { Pencil } from '@services/drawing-tools/pencil';
import { Point } from '@services/drawing-tools/point';
import { Rectangle } from '@services/drawing-tools/rectangle';
import { Selection } from '@services/drawing-tools/selection';
import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';
import {
  ELLIPSE_TOOL_NAME,
  PENCIL_TOOL_NAME,
  RECT_TOOL_NAME,
} from '@services/drawing-tools/tool-names';
// import { ToolboxViewComponent } from '../toolbox-view/toolbox-view.component';
// import { MouseHandler } from '@services/mouse-handler/mouse-handler';
// import { InputObserver } from '@services/drawing-tools/input-observer';

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
  @ViewChild('canvas', { static: false }) canvas!: ElementRef;
  @ViewChild('drawingSpace', { static: false }) drawingSpace!: ElementRef;
  @ViewChild('actualDrawing', { static: false }) doneDrawing!: ElementRef;

  height!: number;
  width!: number;
  backColor: string = '#FFFFFF';

  currentTool!: DrawingTool;
  toolsList: Map<number, DrawingTool>;
  currentToolName = PENCIL_COMP_TOOL_NAME;
  drawingId!: number;
  userId!: string;
  scalingPoint: [Point, Point] | null | undefined;
  mode: string = '';
  totalScaling: Point = new Point(0.0, 0.0);
  mouseIsDown: boolean = false;
  activeUsers: string[];

  constructor(
    private interactionService: InteractionService,
    private renderer: Renderer2,
    private colorPick: ColorPickingService,
    private readonly socketService: SocketService,
    private readonly drawingService: DrawingService,
    private readonly authService: AuthService
  ) {
    this.toolsList = new Map<number, DrawingTool>();
    this.currentToolName = PENCIL_COMP_TOOL_NAME;
    console.log(this.currentToolName);
    this.getDrawingId();
    this.activeUsers = []
    //this.drawingService
  }

  getUserId() {
    this.authService.token$.subscribe((token: string) => {
      this.userId = token;
    });
  }

  getDrawingId() {
    this.drawingService.drawingId$.subscribe((id: number) => {
      this.drawingId = id;
    });
  }

  ngOnInit(): void {
    this.getUserId();
  }

  initDrawing() {
    this.doneDrawing.nativeElement.innerHTML = '';
    this.toolsList.clear();
    const drawingInformations =
      this.interactionService.drawingInformations.value;
    this.backColor = `#${drawingInformations.bgColor!}`;
    this.height = drawingInformations.height!;
    this.width = drawingInformations.width!;
    this.drawingService.drawingName$.next(drawingInformations.name!);
    drawingInformations.contents!.forEach((content) => {
      if (content.content !== null && content.content !== undefined) {
        this.manipulateReceivedDrawing(content);
      }
    });
    this.draw();
  }

  @HostListener('window:resize')
  onResize() {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    this.mouseIsDown = true;
    console.log(this.currentToolName);
    if (this.currentTool !== undefined) {
      // repositionmouse
      const respositionedEvent = Point.rpositionMouse(
        e,
        this.canvas.nativeElement
      );
      this.scalingPoint = this.currentTool.getScalingPoint(
        new Point(respositionedEvent.x, respositionedEvent.y)
      );
      this.totalScaling.makeEqualTo(new Point(0, 0));
    }
    if (this.scalingPoint !== null && this.scalingPoint !== undefined) {
      this.mode = 'scaling';
      console.log(this.mode);
    } else if (this.isInsideTheSelection(e)) {
      this.mode = 'translation';
      console.log(this.mode);
    } else {
      console.log('else statement');
      if (this.currentTool !== undefined && this.currentTool !== null) {
        this.currentTool.unselect();
      }
      if (this.currentToolName === PENCIL_COMP_TOOL_NAME.valueOf()) {
        console.log('here');
        this.currentTool = new Pencil(
          this.interactionService,
          this.colorPick,
          this.socketService,
          this.userId,
          this.renderer,
          this.canvas,
        );
        this.currentTool.drawingId = this.drawingId;
      } else if (this.currentToolName === RECT_COMP_TOOL_NAME.valueOf()) {
        this.currentTool = new Rectangle(
          this.interactionService,
          this.colorPick,
          this.socketService,
          this.userId,
          this.renderer,
          this.canvas,
        );
        this.currentTool.drawingId = this.drawingId;
      } else if (this.currentToolName === ELLIPSE_COMP_TOOL_NAME.valueOf()) {
        this.currentTool = new Ellipse(
          this.interactionService,
          this.colorPick,
          this.socketService,
          this.userId,
          this.renderer,
          this.canvas,
        );
        this.currentTool.drawingId = this.drawingId;
      } else if (this.currentToolName === SELECT_COMP_TOOL_NAME) {
        // TODO
        this.currentTool = new Selection(
          this.toolsList,
          this.socketService,
          this.colorPick,
          this.renderer,
          this.canvas,
          this.interactionService,
          this.drawingId,
          this.userId,
        );
      }
      this.currentTool.onMouseDown(e);
      this.mode = '';
    }
    // this.currentTool.mouseIsDown = true;
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(e: MouseEvent) {
    if (this.currentTool !== undefined && this.currentTool !== null) {
      this.currentTool.onMouseUp(e);
      this.mouseIsDown = false;
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    // TODO
    if (
      this.currentTool !== undefined &&
      this.currentTool !== null &&
      this.mouseIsDown
    ) {
      const reposition = Point.rpositionMouse(e, this.canvas.nativeElement);
      if (
        this.currentTool instanceof Selection &&
        (this.currentTool as Selection).getSelectedTool() !== undefined
      ) {
        switch (this.mode) {
          case 'translation':
            const translation: Point =
              this.currentTool.startTransformPoint.difference(reposition);
            this.currentTool.translate(translation);
            break;

          case 'scaling':
            // let position = Point.rpositionMouse(e, this.canvas.nativeElement);
            const scalingFactor = new Point(
              reposition.x - this.scalingPoint![0].x - this.totalScaling.x,
              reposition.y - this.scalingPoint![0].y - this.totalScaling.y
            );

            this.currentTool.scale(scalingFactor, this.scalingPoint![1]);
            this.totalScaling.plus(scalingFactor);
            break;
          default:
            break;
        }
      } else {
        switch (this.mode) {
          case 'translation':
            const translation: Point =
              this.currentTool.startTransformPoint.difference(
                Point.rpositionMouse(e, this.canvas.nativeElement)
              );
            this.currentTool.translate(translation);
            break;

          case 'scaling':
            const position = Point.rpositionMouse(e, this.canvas.nativeElement);
            const scalingFactor = new Point(
              position.x - this.scalingPoint![0].x - this.totalScaling.x,
              position.y - this.scalingPoint![0].y - this.totalScaling.y
            );
            this.currentTool.scale(scalingFactor, this.scalingPoint![1]);
            break;
          default:
            this.currentTool.onMouseMove(e);
            break;
        }
        // this.currentTool.onMouseMove(e)
      }
    }
  }

  ngAfterViewInit(): void {

    this.interactionService.$leaveDrawingSignal.subscribe((sig)=>{
      if(sig && this.currentTool!== undefined) this.currentTool.unselect();
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.interactionService.$wipeDrawing.subscribe((signal) => {
      this.doneDrawing.nativeElement.innerHTML = '';
      this.toolsList.clear();
    });
    // TODO; Use interactionService to unselect all the tools and select the tool chosen by the user
    if (this.canvas !== undefined) {
      this.initDrawing();
      this.interactionService.$selectedTool.subscribe((toolName: string) => {
        if (toolName) this.currentToolName = toolName;
      });
      this.drawingService.drawingId$.subscribe((id: number) => {
        this.drawingId = id;
      });
      console.log(this.drawingId);

      this.socketService
        .getDrawingContentId()
        .subscribe((data: { contentId: number }) => {
          this.currentTool.contentId = data.contentId;
        });
      this.socketService
        .getDrawingContent()
        .subscribe((data: DrawingContent) => {
          console.log('here receiving');
          if (this.drawingSpace !== undefined) {
            this.manipulateReceivedDrawing(data);
            this.draw();
          }
        });
      this.interactionService.$deleteDrawing.subscribe((sig) => {
        if (sig && this.currentTool !== undefined) {
          this.currentTool.delete();
        }
      });

      this.interactionService.$updateToolSignal.subscribe((sig) => {
        if (sig && this.currentTool !== undefined) {
          this.currentTool.updateThickness();
        }
      });

      this.interactionService.$updateColorSignal.subscribe((sig) => {
        if (sig && this.currentTool !== undefined) {
          this.currentTool.updatePrimaryColor();
          this.currentTool.updateSecondaryColor();
        }
      });
    } else {
      console.log('canvas is undefined');
    }
  }
  draw() {
    // throw new Error('Method not implemented.');
    this.doneDrawing.nativeElement.innerHTML = '';
    this.toolsList.forEach((tool: DrawingTool) => {
      console.log('hey');
      this.doneDrawing.nativeElement.innerHTML += tool.getString();
    });
    // this.doneDrawing.nativeElement.innerHTML += this.toolsList[i].getString();
  }

  manipulateReceivedDrawing(drawingContent: DrawingContent) {
    if (
      drawingContent.id !== undefined &&
      drawingContent.content !== undefined
    ) {
      if (this.toolsList.has(drawingContent.id)) {
        try {
          this.toolsList.get(drawingContent.id)!.parse(drawingContent.content);
        } catch (e) {}
        this.toolsList.get(drawingContent.id)!.selected =
          drawingContent.status === DrawingStatus.Selected;
        this.toolsList.get(drawingContent.id)!.userId = drawingContent.userId;
        if (drawingContent.status === DrawingStatus.Deleted.valueOf()) {
          this.toolsList.delete(drawingContent.id);
          if (this.currentTool instanceof Selection) {
            console.log('here deleting');
            this.currentTool = new Selection(
              this.toolsList,
              this.socketService,
              this.colorPick,
              this.renderer,
              this.canvas,
              this.interactionService,
              this.drawingId,
              drawingContent.userId!,
            );
          }
        }
      } else {
        try {
          let newTool!: DrawingTool;
          switch (drawingContent.toolName) {
            case PENCIL_TOOL_NAME:
              newTool = new Pencil(
                this.interactionService,
                this.colorPick,
                this.socketService,
                drawingContent.userId!,
                this.renderer,
                this.canvas,
              );
              break;

            case RECT_TOOL_NAME:
              // TODO
              newTool = new Rectangle(
                this.interactionService,
                this.colorPick,
                this.socketService,
                drawingContent.userId!,
                this.renderer,
                this.canvas,
              );
              break;
            case ELLIPSE_TOOL_NAME:
              // TODO
              newTool = new Ellipse(
                this.interactionService,
                this.colorPick,
                this.socketService,
                drawingContent.userId!,
                this.renderer,
                this.canvas,
              );
              break;
            default:
              break;
          }
          newTool.userId = drawingContent.userId;
          newTool.contentId = drawingContent.id;
          newTool.selected = drawingContent.status === DrawingStatus.Selected;
          newTool.parse(drawingContent.content);
          // this.toolsList.push(newTool);
          this.toolsList.set(drawingContent!.id, newTool);
        } catch (err) {}
      }
    }
  }

  isInsideTheSelection(e: MouseEvent): boolean {
    if (
      this.currentTool !== undefined &&
      this.currentTool.inTranslationZone(e)
    ) {
      return true;
    }
    return false;
  }
}
