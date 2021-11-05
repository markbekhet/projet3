import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { menuItems, FeatureItem } from '@models/FeatureMeta';
import { Canvas } from '@models/CanvasInfo';
// import { InteractionService } from '@services/interaction-service/interaction.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';

@Component({
  selector: 'app-header-view',
  templateUrl: './header-view.component.html',
  styleUrls: ['./header-view.component.scss'],
})
export class HeaderViewComponent implements OnInit {
  menuItems: FeatureItem[];
  canvasSub!: Subscription;
  currentCanvas!: Canvas;

  constructor(
    private winService: ModalWindowService // private interaction: InteractionService
  ) {
    this.menuItems = menuItems;
  }

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
