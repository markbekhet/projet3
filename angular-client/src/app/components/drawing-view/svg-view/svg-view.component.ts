import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { Canvas } from '@models/CanvasInfo';
import { ChosenColors } from '@models/ChosenColors';
import { DrawingContent, DrawingStatus } from '@models/DrawingMeta';

import { CanvasBuilderService } from '@services/canvas-builder/canvas-builder.service';
import { ColorPickingService } from '@services/colorPicker/color-picking.service';
import { InputObserver } from '@services/draw-tool/input-observer';
import { Pencil } from '@services/draw-tool/pencil';
import { InteractionService } from '@services/interaction-service/interaction.service';
import { MouseHandler } from '@services/mouse-handler/mouse.handler';

const POINTS_REGEX = new RegExp(
  `points="([0-9.?]+ [0-9.?]+(,[0-9.?]+ [0-9.?]+)*)`
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const TRANSLATE_REGX = new RegExp(
//   // eslint-disable-next-line no-useless-escape
//   `transform="translate\(([-?0-9.?])+,([-?0-9.?])+\)"`
// );

@Component({
  selector: 'app-svg-view',
  templateUrl: './svg-view.component.html',
  styleUrls: ['./svg-view.component.scss'],
})
export class SvgViewComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvas: ElementRef | undefined;
  @ViewChild('drawingSpace', { static: false })
  drawingSpace: ElementRef | undefined;
  @ViewChild('actualDrawing', { static: false }) doneDrawing!: ElementRef;
  @ViewChild('inProgress', { static: false }) inProgress!: ElementRef;
  height!: number;
  width!: number;
  backColor: string = '#ffffff';
  toolsContainer = new Map();
  mouseHandler!: MouseHandler;
  contents: Map<number, SVGElement> = new Map();
  constructor(
    private interactionService: InteractionService,
    private renderer: Renderer2,
    private canvBuilder: CanvasBuilderService,
    private colorPick: ColorPickingService
  ) {}

  ngOnInit(): void {
    this.initCanvas();
  }
  bgroundChangedSubscription() {
    this.colorPick.colorSubject.subscribe((choosenColors: ChosenColors) => {
      if (choosenColors) {
        this.backColor = choosenColors.backColor;
        this.colorPick.cData.primaryColor = choosenColors.primColor;
        this.colorPick.cData.secondaryColor = choosenColors.secColor;
        this.colorPick.cData.backgroundColor = choosenColors.backColor;
        this.colorPick.setColorsFromForm(
          choosenColors.primColor,
          choosenColors.secColor,
          choosenColors.backColor
        );
      }
    });
  }
  initCanvas() {
    this.canvBuilder.canvSubject.subscribe((canvas: Canvas) => {
      if (canvas === undefined || canvas === null) {
        // eslint-disable-next-line no-param-reassign
        canvas = this.canvBuilder.getDefCanvas();
      }

      this.width = canvas.canvasWidth;
      this.height = canvas.canvasHeight;
      this.backColor = canvas.canvasColor;
      this.colorPick.cData.backgroundColor = canvas.canvasColor;
      this.colorPick.emitColors();
      if (canvas.wipeAll === true || canvas.wipeAll === undefined) {
        // if no attribute is specified, the doodle will be w
        this.canvBuilder.wipeDraw(this.doneDrawing);
        // this.canvBuilder.wipeDraw(this.filterRef);
        // this.canvBuilder.wipeDraw(this.selectedItems);
      }
    });
    this.canvBuilder.emitCanvas();
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
      this.bgroundChangedSubscription();
      this.interactionService.$drawing.subscribe((data: DrawingContent) => {
        if (this.drawingSpace !== undefined) {
          // console.log(data)
          this.drawContent(data);
        } else {
          console.log('drawing space undefined');
        }
      });
    } else {
      console.log('canvas is undefined');
    }
  }

  // To create tools and add them to the map
  // A map is used instead of if/else
  createTools() {
    const pencil = new Pencil(true, this.interactionService);
    this.toolsContainer.set('Crayon', pencil);
  }

  // This method will be modified especially with the introduction of selected status and deleted status
  drawContent(data: DrawingContent) {
    if (data.status === DrawingStatus.InProgress) {
      if (!this.contents.has(data.contentId)) {
        const newObj = this.createSVGPolyline(data.drawing);
        this.renderer.appendChild(this.inProgress.nativeElement, newObj);
        this.contents.set(data.contentId, newObj);
      } else {
        const element = this.contents.get(data.contentId);
        if (element !== undefined) {
          // this.renderer.removeChild(this.inProgress.nativeElement,element);
          this.modifyPolyline(data.drawing, element);
          this.renderer.appendChild(this.inProgress.nativeElement, element);
        }
      }
    } else if (data.status === DrawingStatus.Done) {
      const element = this.contents.get(data.contentId);
      if (element !== undefined) {
        this.renderer.removeChild(this.inProgress.nativeElement, element);
        this.modifyPolyline(data.drawing, element);
        this.renderer.appendChild(this.doneDrawing.nativeElement, element);
      }
    }
  }

  createSVGPolyline(drawing: string) {
    console.log(drawing);
    const element = this.renderer.createElement(
      'polyline',
      'svg'
    ) as SVGPolylineElement;
    const pointsArray = POINTS_REGEX.exec(drawing);
    if (pointsArray !== null) {
      this.renderer.setAttribute(element, 'points', pointsArray[1].toString());
      this.renderer.setAttribute(element, 'stroke', 'black');
      this.renderer.setAttribute(element, 'stroke-width', '3');
      this.renderer.setAttribute(element, 'stroke-linecap', 'round');
      this.renderer.setAttribute(element, 'fill', 'none');
    }
    return element;
  }

  modifyPolyline(drawing: string, element: SVGElement) {
    this.renderer.removeAttribute(element, 'points');
    const pointsArray = POINTS_REGEX.exec(drawing);
    if (pointsArray !== null) {
      this.renderer.setAttribute(element, 'points', pointsArray[1].toString());
      // this.renderer.setAttribute(element, 'points', points_array[1].toString())
      this.renderer.setAttribute(element, 'stroke', 'black');
      this.renderer.setAttribute(element, 'stroke-width', '5');
    }
    console.log(element.innerHTML);
  }
}
