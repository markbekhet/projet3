/* eslint-disable no-alert */
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { drawingHeaderItems, FeatureItem } from '@models/FeatureMeta';
import { Canvas } from '@models/CanvasInfo';
// import { InteractionService } from '@services/interaction-service/interaction.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { GalleryComponent } from '@components/gallery-component/gallery.component';

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
    private dialogService: ModalWindowService // private interaction: InteractionService
  ) {
    this.menuItems = drawingHeaderItems;
  }

  openNewDrawingForm() {
    if (
      window.confirm('Un dessin est déjà en cours. Voulez-vous continuer ?')
    ) {
      this.dialogService.openDialog(NewDrawingComponent);
    }
  }

  openGallery() {
    if (
      window.confirm('Vous avez un dessin en cours. Voulez-vous continuer ?')
    ) {
      this.dialogService.openDialog(GalleryComponent);
    }
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}
}
