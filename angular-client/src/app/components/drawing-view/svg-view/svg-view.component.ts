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

import { Canvas } from '@models/CanvasInfo';
import { DrawingContent, DrawingStatus } from '@models/DrawingMeta';

import { CanvasBuilderService } from '@services/canvas-builder/canvas-builder.service';
import { ColorPickingService } from '@services/color-picker/color-picking.service';
import { DrawingTool } from '@services/drawing-tools/drawing-tool';
import { Ellipse } from '@services/drawing-tools/ellipse';
import { InputObserver } from '@services/drawing-tools/input-observer';
import { InteractionService } from '@services/interaction/interaction.service';
import { MouseHandler } from '@services/mouse-handler/mouse-handler';
import { Pencil } from '@services/drawing-tools/pencil';
import { Rectangle } from '@services/drawing-tools/rectangle';

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
  backColor: string = '#FFFFFF';
  toolsContainer = new Map();
  mouseHandler!: MouseHandler;
  contents: Map<number, SVGElement> = new Map();
  // temporary
  itemCounter: number = 0;

  constructor(
    private interactionService: InteractionService,
    private renderer: Renderer2,
    private canvBuilder: CanvasBuilderService,
    private colorPick: ColorPickingService
  ) {}

  ngOnInit(): void {
    this.initCanvas();

  bgroundChangedSubscription() {}

  initCanvas() {
    this.canvBuilder.canvSubject.subscribe((canvas: Canvas) => {
      if (canvas === undefined || canvas === null) {
        canvas = this.canvBuilder.getDefCanvas();
      }

      this.width = canvas.canvasWidth;
      this.height = canvas.canvasHeight;
      this.backColor = canvas.canvasColor;
      if (canvas.wipeAll === true || canvas.wipeAll === undefined) {
        // if no attribute is specified, the doodle will be w
        this.canvBuilder.wipeDraw(this.doneDrawing);
        // this.canvBuilder.wipeDraw(this.filterRef);
        // this.canvBuilder.wipeDraw(this.selectedItems);
      }
    });
    this.canvBuilder.emitCanvas();

    this.interactionService.$selectedTool.subscribe((tool: string) => {
      this.updateSelectedTool(tool);
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
      this.bgroundChangedSubscription();
      this.interactionService.$drawing.subscribe((data: DrawingContent) => {
        // console.log(data.drawing);
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
    const pencil = new Pencil(true, this.interactionService, this.colorPick);
    const rectangle = new Rectangle(
      false,
      this.interactionService,
      this.colorPick
    );
    const ellipse = new Ellipse(false, this.interactionService, this.colorPick);

    this.toolsContainer.set('Crayon', pencil);
    this.toolsContainer.set('Rectangle', rectangle);
    this.toolsContainer.set('Ellipse', ellipse);
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

  // This method will be modified especially with the introduction of selected status and deleted status
  drawContent(data: DrawingContent) {
    if (data.status === DrawingStatus.InProgress.valueOf()) {
      if (!this.contents.has(data.contentID)) {
        // new elements
        let newObj!: SVGElement;
        if (data.drawing.includes('polyline')) {
          console.log(`pencil: ${data.drawing}`);
          newObj = this.createSVGPolyline(data.drawing);
        } else if (data.drawing.includes('rect')) {
          console.log(`rect: ${data.drawing}`);
          newObj = this.createSVGRect(data.drawing);
        } else if (data.drawing.includes('ellipse')) {
          console.log(`ell: ${data.contentID}`);
          newObj = this.createSVGEllipse(data.drawing);
        }

        if (newObj !== null) {
          this.renderer.appendChild(this.inProgress.nativeElement, newObj);
          this.contents.set(data.contentID, newObj);
        }
      } else {
        const element = this.contents.get(data.contentID);
        if (element !== undefined) {
          // this.renderer.removeChild(this.inProgress.nativeElement,element);
          if (data.drawing.includes('polyline')) {
            this.modifyPolyline(data.drawing, element);
          } else if (data.drawing.includes('rect')) {
            this.modifyRect(data.drawing, element);
          } else if (data.drawing.includes('ellipse')) {
            this.modifyEllipse(data.drawing, element);
            // console.log(data.drawing);
          }
          this.renderer.appendChild(this.inProgress.nativeElement, element);
        }
      }
    } else if (data.status === DrawingStatus.Done.valueOf()) {
      const element = this.contents.get(data.contentID);
      if (element !== undefined) {
        this.renderer.removeChild(this.inProgress.nativeElement, element);
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
