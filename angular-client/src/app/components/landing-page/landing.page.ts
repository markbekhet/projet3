import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { menuItems, FeatureItem } from '@models/FeatureMeta';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { Router } from '@angular/router';
import { SocketService } from '@src/app/services/socket/socket.service';
import { NewTeamDialogComponent } from '../new-team-dialog/new-team-dialog.component';
import { ChatHistory } from '@src/app/models/MessageMeta';
import { ChatRoomService } from '@src/app/services/chat-room/chat-room.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit, AfterViewInit {
  menuItems: FeatureItem[];
  windowService: ModalWindowService;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private auth: AuthService,
    private router: Router,
    private readonly socketService: SocketService,
    private readonly chatRoomService: ChatRoomService,
  ) {
    this.windowService = new ModalWindowService(this.dialog);
    this.menuItems = menuItems;
  }

  ngOnInit(): void {
    this.showWelcomeMsg();
    if(this.socketService.socket === undefined){
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
    if(this.auth.token$.value !== ""){
      this.auth.disconnect()
    }
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

  openCraeteNewTeam(){
    this.windowService.openWindow(NewTeamDialogComponent);
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
