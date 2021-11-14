import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { homeHeaderItems, FeatureItem } from '@models/FeatureMeta';
import { AuthService } from '@services/authentication/auth.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { GalleryComponent } from '@components/gallery-component/gallery.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPage implements OnInit {
  menuItems: FeatureItem[];
  windowService: ModalWindowService;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.windowService = new ModalWindowService(this.dialog);
    this.menuItems = homeHeaderItems;
    this.isLoggedIn = true;
  }

  ngOnInit(): void {
    this.showWelcomeMsg();
  }

  showWelcomeMsg(): void {
    const CONFIG = new MatSnackBarConfig();
    const DURATION = 2000;
    CONFIG.duration = DURATION;
    this.snackBar.open('Bienvenue !', undefined, CONFIG);
  }

  openCreateNewDrawing() {
    // if (inTeam) {  this.authService.isUserInTeam()
    //   this.windowService.openDialog(ChooseOwnerComponent);
    // }
    this.windowService.openDialog(NewDrawingComponent);
  }

  openGallery() {
    this.windowService.openDialog(GalleryComponent);
  }

  disconnect() {
    this.authService.disconnect();
  }

  execute(shortcutName: string) {
    switch (shortcutName) {
      case 'Créer':
        this.openCreateNewDrawing();
        break;
      case 'Déconnecter':
        this.disconnect();
        break;
      case 'Ouvrir':
        this.openGallery();
        break;
      default:
        break;
    }
  }
}
