import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { menuItems, FeatureItem } from '@models/FeatureMeta';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { Router } from '@angular/router';
import { SocketService } from '@src/app/services/socket/socket.service';
import { UserToken } from '@src/app/services/static-services/user_token';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  menuItems: FeatureItem[];
  windowService: ModalWindowService;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private auth: AuthService,
    private router: Router,
    private readonly socketService: SocketService
  ) {
    this.windowService = new ModalWindowService(this.dialog);
    this.menuItems = menuItems;
  }

  ngOnInit(): void {
    console.log(UserToken.userToken);
    this.showWelcomeMsg();
    this.socketService.connect();
  }

  showWelcomeMsg(): void {
    const CONFIG = new MatSnackBarConfig();
    const DURATION = 2000;
    CONFIG.duration = DURATION;
    this.snackBar.open('Bienvenue !', undefined, CONFIG);
  }

  openCreateNewDrawing() {
    this.windowService.openWindow(NewDrawingComponent);
  }

  openGallery() {
    // TODO: Implement
  }

  disconnect() {
    this.auth.disconnect().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  execute(shortcutName: string) {
    switch (shortcutName) {
      case 'Créer':
        this.openCreateNewDrawing();
        break;
      case 'Ouvrir':
        this.openGallery();
        break;
      case 'Disconnect':
        this.disconnect();
        break;
      case 'Profile':
        this.profile();
        break;
      default:
        break;
    }
  }
  profile() {
    this.router.navigate(['/profile']);
  }
}
