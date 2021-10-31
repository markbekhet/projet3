import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { menuItems } from '@src/app/features';
import { Canvas } from '@models/CanvasInfo';
import { FeatureItem } from '@models/FeatureItem';
// import { InteractionService } from '@services/interaction-service/interaction.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';

@Component({
  selector: 'app-header-view',
  templateUrl: './header-view.component.html',
  styleUrls: ['./header-view.component.scss'],
})
export class HeaderViewComponent implements OnInit {
  funcMenu: FeatureItem[] = menuItems;
  canvasSub!: Subscription;
  currentCanvas!: Canvas;

  constructor(
    private winService: ModalWindowService // private interaction: InteractionService
  ) {}

  openNewDrawingForm() {
    // eslint-disable-next-line no-alert
    if (window.confirm('Un dessin est déjà en cours. Voulez-vous continuer?')) {
      this.winService.openWindow(NewDrawingComponent);
    }
  }

  openGallery() {
    // TODO
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}
}
