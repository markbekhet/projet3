/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @angular-eslint/component-class-suffix */
/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  // ComponentRef,
  // ElementRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
// import { HttpErrorResponse } from '@angular/common/http';

import {
  MatBottomSheet,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { TooltipPosition } from '@angular/material/tooltip';

import { JoinTeam, LeaveTeam } from '@models/joinTeam';
// import { ChatHistory } from '@models/MessageMeta';
import { Team } from '@models/teamsMeta';
import { User, Status } from '@models/UserMeta';
import { TeamVisibilityLevel } from '@models/VisibilityMeta';
import { ActiveUser } from '@models/active-user';

import { AuthService } from '@services/authentication/auth.service';
import { AvatarService } from '@services/avatar/avatar.service';
import { ChatRoomService } from '@services/chat-room/chat-room.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';
import { TeamService } from '@services/team/team.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

import { ChatComponent } from '@components/chat-component/chat.component';
import { ErrorDialogComponent } from '@components/error-dialog/error-dialog.component';
import { UserProfileDialogComponent } from '@components/user-profile-dialog/user-profile-dialog.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TeamMembersListComponent } from './team-members-list/team-members-list.component';
// import { HttpErrorResponse } from 'Colorimage-win32-x64/resources/app/node_modules/@angular/common/http';

@Component({
  selector: 'app-user-team-list',
  templateUrl: './user-team-list.component.html',
  styleUrls: ['./user-team-list.component.scss'],
})
export class UserTeamListComponent implements OnInit, AfterViewInit {
  authenticatedUserId: string;

  users: User[] = [];
  teams: Team[] = [];
  chatrooms: string[] = [];

  removable: boolean = true;
  // joinedChatrooms = new Map<name, Chatroom>();

  joinedChatrooms = new Map<string, boolean>();

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
    private bottomSheetService: MatBottomSheet,
    private chatRoomService: ChatRoomService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private errorDialog: MatDialog,
    private interactionService: InteractionService,
    private socketService: SocketService,
    private snackbar: MatSnackBar,
    private teamService: TeamService,
    private windowService: ModalWindowService
  ) {
    this.authenticatedUserId = this.authService.getUserToken();
    this.chatComponentFactory =
      this.componentFactoryResolver.resolveComponentFactory(ChatComponent);
    for (const room of this.chatRoomService.chatRooms.keys()) {
      if (room !== 'General') {
        this.chatrooms.push(room);
      }
    }
  }

  ngOnInit(): void {
    this.socketService.getAllUsers().subscribe((usersMap) => {
      usersMap.forEach((user) => {
        this.users.push(user);
      });
    });

    this.socketService.getAllTeams().subscribe((teamsMap) => {
      teamsMap.forEach((team) => {
        if (!this.chatrooms.includes(team.name)) this.teams.push(team);
      });
    });
  }

  ngAfterViewInit() {
    // user update
    this.socketService.getUserUpdate().subscribe((userModified: User) => {
      let found: boolean = false;
      this.users.forEach((user: User) => {
        if (userModified.id! === user.id!) {
          found = true;
          user.pseudo = userModified.pseudo;
          user.status = userModified.status;
          user.avatar = userModified.avatar;
        }
      });
      if (!found) {
        this.users.push(userModified);
      }
    });

    // newTeamCreated
    this.socketService.socket!.on('newTeamCreated', (data: any) => {
      const newTeam: Team = JSON.parse(data);

      // let found = false;
      /* this.chatRoomList.forEach((chatRoom)=>{
        if(chatRoom.id === newTeam.id){
          found = true;
        }
      }) */

      if (this.chatrooms.indexOf(newTeam.name!) === -1) {
        this.teams.push(newTeam);
      }
    });

    this.socketService.socket!.on('newJoinToTeam', (data: any) => {
      const dataMod: { teamName: string; userId: string } = JSON.parse(data);
      const { activeUsers } = this.teamService.activeTeams.value.get(
        dataMod.teamName
      )!;
      activeUsers.push({ userId: dataMod.userId });
    });

    this.socketService.socket!.on('userLeftTeam', (data: any) => {
      const dataMod: { teamName: string; userId: string } = JSON.parse(data);
      const team = this.teamService.activeTeams.value.get(dataMod.teamName);
      if (team !== undefined) {
        team.activeUsers.forEach((activeUser: ActiveUser) => {
          if (activeUser.userId === dataMod.userId) {
            team!.activeUsers.splice(team!.activeUsers.indexOf(activeUser), 1);
          }
        });
      }
    });

    this.socketService.socket!.on('teamDeleted', (data: any) => {
      const deletedTeam: Team = JSON.parse(data);
      this.teams.forEach((team) => {
        if (team.id === deletedTeam.id) {
          const index = this.teams.indexOf(team);
          this.teams.splice(index, 1);
        }
      });
    });

    // teamJoined
    this.interactionService.$updateChatListSignal.subscribe((sig: boolean) => {
      if (sig) {
        this.chatrooms = [];
        for (const key of this.chatRoomService.chatRooms.keys()) {
          this.chatrooms.push(key);
        }
        // (Note-Paul) : I don't keep channel General in the array, it's easier that way
        this.chatrooms.shift();

        // let teamFound = false;
        this.chatrooms.forEach((room: string) => {
          this.teams.forEach((team: Team) => {
            if (team.name === room) {
              this.teams.splice(this.teams.indexOf(team), 1);
            }
          });
        });
      }
    });

    // To fill arrays when loading page for first time - PROBLEM WITH THIS BIT OF CODE, we dont have chatroomService map filled
    // when this code executes.

    // console.log(this.chatRoomService.chatRooms.keys());
    // for (const key of this.chatRoomService.chatRooms.keys()) {
    //   this.chatrooms.push(key);
    // }
    // [this.mainChatroomName] = this.chatrooms;
    // console.log(
    //   'TURBO 🚀 - file: user-team-list.component.ts - line 171 - UserTeamListComponent - this.mainChatroomName',
    //   this.mainChatroomName
    // );
    // this.chatrooms.shift();

    // BUG (Paul) : on envoie au serveur qu'on join une équipe, mais quand on reload après reconnexion il nous envoie pas les team
    // dont on fait déjà parti. Faque on rejoint des équipes mais si on les quitte pas pendant le flow, si on se reco entre temps,
    // on fera toujours parti de l'équipe, mais il faut soit reset les équipes d'un user du côté serveur, soit binder proprement
    // au client
    // Mais apparemment ça fonctionne côté serveur maintenant,
    this.socketService.socket!.on('cantJoinTeam', (data: any) => {
      const error: { message: string } = JSON.parse(data);
      this.errorDialog.open(ErrorDialogComponent, { data: error.message });
    });

    this.users.shift();
    console.log('TURBO 🚀 line 99 - UserTeamListComponent - users', this.users);

    this.chatInsert.clear();
  }

  isTeamChannel(roomName: string): boolean {
    const team = this.teamService.activeTeams.value.get(roomName);
    if (team !== undefined) {
      return true;
    }
    return false;
  }

  joinTeam(team: Team) {
    if (team.visibility === TeamVisibilityLevel.PROTECTED) {
      this.bottomSheetService.open(TeamPasswordBottomSheet, {
        data: { team },
      });
    } else {
      const joinTeamBody: JoinTeam = {
        teamName: team.name,
        userId: this.authenticatedUserId,
      };
      this.socketService.sendRequestJoinTeam(joinTeamBody);
      this.teamService.requestedTeamToJoin.next(team);
    }
  }

  deleteTeam(team: Team) {
    const deleteTeamBody = { teamId: team.id, userId: team.ownerId! };
    this.teamService.deleteTeam(deleteTeamBody).subscribe(
      (res) => {
        // this.teams.splice(this.teams.indexOf(team), 1)
      },
      (error) => {
        /* const errorCode: HttpErrorResponse = JSON.parse(
          (error ).error
        ).message; */
        // console.log(errorCode)
        console.log(error.error.message);
        this.errorDialog.open(ErrorDialogComponent, {
          data: error.error.message,
        });
      }
    );
  }

  leaveTeam(teamName: string) {
    const leaveTeamBodyRequest: LeaveTeam = {
      teamName,
      userId: this.authenticatedUserId,
    };
    this.socketService.leaveTeam(leaveTeamBodyRequest);

    // const index = this.chatrooms.indexOf(teamName);
    // this.chatrooms.splice(index, 1);
    this.joinedChatrooms.set(teamName, false);

    this.chatRoomService.refs.get(teamName)!.destroy();
    this.chatRoomService.refs.delete(teamName);

    const activeTeam = this.teamService.activeTeams.value.get(teamName)!;
    const team: Team = {
      id: activeTeam.id,
      name: activeTeam.name,
      visibility: activeTeam.visibility,
      bio: activeTeam.bio,
      ownerId: activeTeam.ownerId,
    };
    this.teams.push(team);

    this.teamService.leftTeamId.next(
      this.teamService.activeTeams.value.get(teamName)!.id
    );
    this.teamService.activeTeams.value.delete(teamName);
    this.chatRoomService.chatRooms.delete(teamName);
    this.interactionService.emitUpdateChatListSignal();
    this.interactionService.emitUpdateGallerySignal();
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
    } else {
      const CONFIG = new MatSnackBarConfig();
      const DURATION = 4000;
      CONFIG.duration = DURATION;
      this.snackbar.open(
        'Vous ne pouvez pas ouvrir plus de 3 canaux à la fois.',
        undefined,
        CONFIG
      );
    }

    // this.joinedChatrooms.set(roomName, true);
    // }

    // Sinon si la chatbox est déjà ouverte
    // else {
    // }
  }

  removeChat(chatroom: string) {
    const index = this.chatrooms.indexOf(chatroom);

    if (index >= 0) {
      this.chatrooms.splice(index, 1);
    }
  }

  removeTeam(team: Team) {
    const index = this.teams.indexOf(team);

    if (index >= 0) {
      this.teams.splice(index, 1);
    }
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

  viewUserProfile(user: User) {
    this.windowService.openDialog(UserProfileDialogComponent, user);
  }

  decodeAvatar(avatarEncoded?: string) {
    if (avatarEncoded === undefined) {
      return '';
    }
    return this.avatarService.decodeAvatar(avatarEncoded);
  }

  openTeamInformations(teamName: string) {
    this.windowService.openDialog(TeamMembersListComponent, teamName);
  }
}

@Component({
  selector: 'app-team-password-bottom-sheet',
  templateUrl: './team-password/team-password.component.html',
  styleUrls: ['./team-password/team-password.component.scss'],
})
export class TeamPasswordBottomSheet {
  password: string = '';
  userId: string;
  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private teamService: TeamService,
    private bottomSheetRef: MatBottomSheetRef<TeamPasswordBottomSheet>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    private infos: { team: Team }
  ) {
    this.userId = this.authService.token$.value;
  }

  close(event: MouseEvent) {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
  submit(event: MouseEvent) {
    const joinTeamRequest: JoinTeam = {
      teamName: this.infos.team.name,
      userId: this.userId,
      password: this.password,
    };
    console.log(joinTeamRequest);
    this.close(event);
    this.socketService.sendRequestJoinTeam(joinTeamRequest);
    this.teamService.requestedTeamToJoin.next(this.infos.team);
  }
}
