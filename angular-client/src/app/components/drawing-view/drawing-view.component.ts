import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { InteractionService } from '@services/interaction/interaction.service';
import { AuthService } from '@src/app/services/authentication/auth.service';

@Component({
  templateUrl: './drawing-view.component.html',
  styleUrls: ['./drawing-view.component.scss'],
})
export class DrawingViewComponent implements AfterViewInit {
  @ViewChild('workingSpace', { static: false }) workingSpaceRef!: ElementRef;

  constructor(
    public interaction: InteractionService,
    private authService: AuthService
  ) {}

  @HostListener('window:beforeunload')
  disconnect() {
    if (this.authService.getUserToken() !== '') {
      this.authService.disconnect();
    }
  }

  ngAfterViewInit(): void {
    this.interaction.emitRef(this.workingSpaceRef);
  }

  adaptWindowSize() {
    window.dispatchEvent(new Event('resize'));
  }
}
