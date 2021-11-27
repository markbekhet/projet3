import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss'],
})
export class ThumbnailComponent implements OnInit, AfterViewInit {
  @Input()
  drawing!: Element;
  @Input()
  svgWidth!: number;
  @Input()
  svgHeight!: number;

  viewBoxStr: string = '';

  @ViewChild('previewBox', { static: false })
  previewBoxRef!: ElementRef; // has an eye on the <svg> element

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    const SCALE = 6.2;
    this.scaleSVG(SCALE);
  }

  ngAfterViewInit(): void {
    this.renderer.appendChild(this.previewBoxRef.nativeElement, this.drawing);
  }

  scaleSVG(scaleFacor: number): void {
    const W_LIMIT = window.innerWidth / scaleFacor; // in pixels, avoids having a very large preview box relatively to the screen
    const H_LIMIT = window.innerHeight / scaleFacor;

    const VIEWBOX_W = this.svgWidth;
    const VIEWBOX_H = this.svgHeight;
    this.viewBoxStr = `0 0 ${VIEWBOX_W} ${VIEWBOX_H}`; // Viewing the whole svg...

    this.svgHeight = H_LIMIT + 1;

    while (this.svgWidth / this.svgHeight > W_LIMIT / H_LIMIT) {
      this.svgWidth -= 1;
    }
  }
}
