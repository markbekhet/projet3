/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import {
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { Status, User } from '@models/UserMeta';

import { AuthService } from '@services/authentication/auth.service';
import { AvatarService } from '@services/avatar/avatar.service';
import { ChatRoomService } from '@services/chat-room/chat-room.service';
import { userColorMap } from '@services/drawing/drawing.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';
import { TeamService } from '@services/team/team.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

import { ChatComponent } from '@components/chat-component/chat.component';
import { TooltipPosition } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TeamMembersListComponent } from '../../user-team-list/team-members-list/team-members-list.component';

@Component({
  selector: 'app-user-list-side-nav',
  templateUrl: './user-list-side-nav.component.html',
  styleUrls: ['./user-list-side-nav.component.scss'],
})
export class UserListSideNavComponent implements OnInit, AfterViewInit {
  authenticatedUserId: string;

  users: { color: string; info: User }[] = [];
  teams: any;
  chatrooms: string[] = [];

  joinedChatrooms = new Map<string, boolean>();

  removable: boolean = true;

  @Output()
  chatroomName = new EventEmitter<string>();
  @Output()
  isExpanded: boolean = true;

  @ViewChild('chatInsert', { read: ViewContainerRef })
  chatInsert!: ViewContainerRef;

  chatComponentFactory: ComponentFactory<ChatComponent>;

  abovePosition: TooltipPosition = 'above';

  constructor(
    private authService: AuthService,
    private avatarService: AvatarService,
    private chatRoomService: ChatRoomService,
    private snackbar: MatSnackBar,
    private componentFactoryResolver: ComponentFactoryResolver,
    private interactionService: InteractionService,
    private socketService: SocketService,
    private teamService: TeamService,
    private windowService: ModalWindowService
  ) {
    this.authenticatedUserId = this.authService.getUserToken();
    this.users = [];
    for (const room of this.chatRoomService.chatRooms.keys()) {
      if (room !== 'General') {
        this.chatrooms.push(room);
      }
    }

    this.chatComponentFactory =
      this.componentFactoryResolver.resolveComponentFactory(ChatComponent);
  }

  ngOnInit(): void {
    const activeUsers = this.interactionService.currentDrawingActiveUsers.value;
    activeUsers.forEach((activeUser) => {
      const user = this.socketService.users$.value.get(activeUser.userId);
      for (const entry of userColorMap) {
        if (entry[1] === undefined) {
          this.users.push({ color: entry[0], info: user! });
          userColorMap.set(entry[0], activeUser.userId);
          break;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.socketService.socket!.on('newJoinToDrawing', (data: any) => {
      const dataMod: { drawingId: number; userId: string } = JSON.parse(data);
      // let mapEntries = userColorMap.entries();
      const user = this.socketService.users$.value.get(dataMod.userId);
      for (const entry of userColorMap) {
        if (entry[1] === undefined) {
          this.users.push({ color: entry[0], info: user! });
          userColorMap.set(entry[0], dataMod.userId);
          break;
        }
      }
    });

    this.socketService.socket!.on('userLeftDrawing', (data: any) => {
      const dataMod: { drawingId: number; userId: string } = JSON.parse(data);
      // let mapEntries = userColorMap.entries();
      for (const entry of userColorMap) {
        if (entry[1] === dataMod.userId) {
          userColorMap.set(entry[0], undefined);
          break;
        }
      }
      this.users.forEach((user) => {
        if (user.info.id! === dataMod.userId) {
          this.users.splice(this.users.indexOf(user), 1);
        }
      });
    });
  }

  joinChat(roomName: string) {
    console.log(roomName);
    // Si la chatbox n'est pas déjà ouverte
    // if (
    //   this.joinedChatrooms.get(roomName) === false ||
    //   this.joinedChatrooms.get(roomName) === undefined
    // ) {

    if (
      this.chatRoomService.refs.get(roomName) === undefined &&
      this.chatRoomService.refs.size < 3
    ) {
      this.interactionService.chatRoomName.next(roomName);
      const componentRef = this.chatInsert.createComponent(
        this.chatComponentFactory
      );

      this.chatRoomService.refs.set(roomName, componentRef);

      const chatComponent = <ChatComponent>componentRef.instance;
      chatComponent.chatroomName = roomName;
      chatComponent.isExpanded = true;
    } else if (this.chatRoomService.refs.size >= 3) {
      const CONFIG = new MatSnackBarConfig();
      const DURATION = 4000;
      CONFIG.duration = DURATION;
      this.snackbar.open(
        'Vous ne pouvez pas ouvrir plus de 3 canaux à la fois.',
        undefined,
        CONFIG
      );
    } else {
      const CONFIG = new MatSnackBarConfig();
      const DURATION = 2000;
      CONFIG.duration = DURATION;
      this.snackbar.open('Ce canal est déjà ouvert.', undefined, CONFIG);
    }
  }

  removeChat(chatroom: string): void {
    const index = this.chatrooms.indexOf(chatroom);

    if (index >= 0) {
      this.chatrooms.splice(index, 1);
    }
  }

  isTeamChannel(roomName: string): boolean {
    const team = this.teamService.activeTeams.value.get(roomName);
    if (team !== undefined) {
      return true;
    }
    return false;
  }

  displayUserOnlineStatus(userStatus?: Status): string {
    switch (userStatus) {
      case Status.ONLINE:
        return 'En ligne';
      case Status.BUSY:
        return 'Occupé';
      case Status.OFFLINE:
        return 'Hors ligne';
      default:
        return '';
    }
  }

  decodeAvatar(avatarEncoded: string) {
    if (avatarEncoded === undefined) {
      return '';
    }
    return this.avatarService.decodeAvatar(avatarEncoded);
  }

  openTeamInformations(teamName: string) {
    this.windowService.openDialog(TeamMembersListComponent, teamName);
  }
}
