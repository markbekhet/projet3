import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { homeHeaderItems, FeatureItem } from '@models/FeatureMeta';
import { AuthService } from '@services/authentication/auth.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { SocketService } from '@services/socket/socket.service';
import { UserToken } from '@services/static-services/user_token';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';

@Component({
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPage implements OnInit {
  menuItems: FeatureItem[];
  windowService: ModalWindowService;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private readonly socketService: SocketService
  ) {
    this.windowService = new ModalWindowService(this.dialog);
    this.menuItems = homeHeaderItems;
    this.isLoggedIn = true;
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
    // if (inTeam) {  this.authService.isUserInTeam()
    //   this.windowService.openDialog(ChooseOwnerComponent);
    // }
    this.windowService.openDialog(NewDrawingComponent);
  }

  disconnect() {
    this.authService.disconnect();
    this.router.navigate(['/login']);
  }

  execute(shortcutName: string) {
    switch (shortcutName) {
      case 'Créer':
        this.openCreateNewDrawing();
        break;
      case 'Déconnexion':
        this.disconnect();
        break;
      default:
        break;
    }
  }
}
