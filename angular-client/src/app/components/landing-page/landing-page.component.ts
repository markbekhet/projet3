import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { homeHeaderItems, FeatureItem } from '@models/FeatureMeta';
import { ChatHistory } from '@models/MessageMeta';
import { AuthService } from '@services/authentication/auth.service';
import { ChatRoomService } from '@services/chat-room/chat-room.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { SocketService } from '@services/socket/socket.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { NewTeamDialogComponent } from '@components/new-team-dialog/new-team-dialog.component';
import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { userColorMap } from '@src/app/services/drawing/drawing.service';

@Component({
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPage implements OnInit, AfterViewInit {
  menuItems: FeatureItem[];
  windowService: ModalWindowService;
  isLoggedIn = false;

  constructor(
    private interactionService: InteractionService,
    private authService: AuthService,
    private chatRoomService: ChatRoomService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private socketService: SocketService
  ) {
    this.windowService = new ModalWindowService(this.dialog);
    this.menuItems = homeHeaderItems;
    this.isLoggedIn = true;
    userColorMap.set("#CBCB28", this.authService.token$.value);
  }

  ngOnInit(): void {
    this.showWelcomeMsg();
    if (this.socketService.socket === undefined) {
      this.socketService.connect();
    }
  }

  ngAfterViewInit(){
    this.socketService.socket!.on("RoomChatHistories", (data: string)=>{
      let chatHistories: {chatHistoryList: ChatHistory[]} = JSON.parse(data);
      console.log(chatHistories);
      this.chatRoomService.addChatRoom(
        'General',
        chatHistories.chatHistoryList
      );
      this.interactionService.emitUpdateChatListSignal()
    });
  }

  @HostListener('window:beforeunload')
  disconnectX() {
    if (this.authService.getUserToken() !== '') {
      this.authService.disconnect();
    }
  }

  showWelcomeMsg(): void {
    const CONFIG = new MatSnackBarConfig();
    const DURATION = 2000;
    CONFIG.duration = DURATION;
    this.snackBar.open('Bienvenue !', undefined, CONFIG);
  }

  execute(shortcutName: string) {
    switch (shortcutName) {
      case 'Créer dessin':
        this.openCreateNewDrawing();
        break;
      case 'Créer équipe':
        this.openCreateNewTeam();
        break;
      case 'Profil':
        this.profile();
        break;
      case 'Chat':
        this.chat();
        break;
      case 'Déconnexion':
        this.disconnect();
        break;
      default:
        break;
    }
  }

  openCreateNewDrawing() {
    // if (inTeam) {  this.authService.isUserInTeam()
    //   this.windowService.openDialog(ChooseOwnerComponent);
    // }
    this.windowService.openDialog(NewDrawingComponent);
  }

  openCreateNewTeam() {
    this.windowService.openDialog(NewTeamDialogComponent);
  }

  disconnect() {
    this.authService.disconnect().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  profile() {
    this.router.navigate(['/profile']);
  }

  chat() {
    this.router.navigate(['/chat']);
  }
}
