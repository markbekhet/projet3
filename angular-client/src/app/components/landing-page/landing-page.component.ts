import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { homeHeaderItems, FeatureItem } from '@models/FeatureMeta';
import { AuthService } from '@services/authentication/auth.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { SocketService } from '@services/socket/socket.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { NewTeamDialogComponent } from '../new-team-dialog/new-team-dialog.component';
import { ChatHistory } from '@src/app/models/MessageMeta';
import { ChatRoomService } from '@src/app/services/chat-room/chat-room.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPage implements OnInit, AfterViewInit {
  menuItems: FeatureItem[];
  windowService: ModalWindowService;
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private readonly socketService: SocketService,
    private readonly chatRoomService: ChatRoomService,
  ) {
    this.windowService = new ModalWindowService(this.dialog);
    this.menuItems = homeHeaderItems;
    this.isLoggedIn = true;
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
      this.chatRoomService.addChatRoom('General', chatHistories.chatHistoryList)
    })
  }
  @HostListener("window:beforeunload")
  disconnectX(){
    if(this.authService.token$.value !== ""){
      this.authService.disconnect()
    }
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

  openCraeteNewTeam() {
    this.windowService.openDialog(NewTeamDialogComponent);
  }

  disconnect() {
    this.authService.disconnect().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  execute(shortcutName: string) {
    switch (shortcutName) {
      case 'Créer':
        this.openCreateNewDrawing();
        break;
      case 'Déconnexion':
        this.disconnect();
        break;
      case 'Profile':
        this.profile();
        break;
      case 'Chat':
        this.chat();
        break;
      case 'equipe':
        this.openCraeteNewTeam();
        break;
      default:
        break;
    }
  }
  profile() {
    this.router.navigate(['/profile']);
  }

  chat() {
    this.router.navigate(['/chat']);
  }
}
