import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { InteractionService } from '@services/interaction/interaction.service';

@Component({
  templateUrl: './drawing-view.component.html',
  styleUrls: ['./drawing-view.component.scss'],
})
export class DrawingViewComponent implements AfterViewInit {
  @ViewChild('workingSpace', { static: false }) workingSpaceRef!: ElementRef;

  constructor(public interaction: InteractionService) {}

  ngAfterViewInit(): void {
    this.interaction.emitRef(this.workingSpaceRef);
  }

  adaptWindowSize() {
    window.dispatchEvent(new Event('resize'));
  }
}
