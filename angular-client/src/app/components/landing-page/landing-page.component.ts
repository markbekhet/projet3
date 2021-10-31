import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { menuItems } from '@src/app/features';
import { FeatureItem } from '@models/FeatureItem';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  menuItems: FeatureItem[];
  windowService: ModalWindowService;
  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) {
    this.windowService = new ModalWindowService(this.dialog);
    this.menuItems = menuItems;
  }

  ngOnInit(): void {
    this.onOpen();
  }

  onOpen(): void {
    const CONFIG = new MatSnackBarConfig();
    const DURATION = 2500;
    CONFIG.duration = DURATION; // temps de visibilité de la barre de bienvenue (ms)
    this.snackBar.open('Bienvenue !', undefined, CONFIG);
  }

  openCreateNewDrawing() {
    this.windowService.openWindow(NewDrawingComponent);
  }

  openGallery() {
    // TODO: Implement
  }

  execute(shortcutName: string) {
    switch (shortcutName) {
      case 'Créer': {
        this.openCreateNewDrawing();
        break;
      }
      case 'Ouvrir': {
        this.openGallery();
        break;
      }
      default:
        break;
    }
  }
}
