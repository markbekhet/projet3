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
  EventEmitter,
  Inject,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { JoinTeam, LeaveTeam } from '@models/joinTeam';
// import { ChatHistory } from '@models/MessageMeta';
import { Team } from '@models/teamsMeta';
import { User } from '@models/UserMeta';
import {
  MatBottomSheet,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { TeamVisibilityLevel } from '@models/VisibilityMeta';

import { AuthService } from '@services/authentication/auth.service';
import { ChatRoomService } from '@services/chat-room/chat-room.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';
import { TeamService } from '@services/team/team.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

import { ChatComponent } from '@components/chat-component/chat.component';
import { ErrorDialogComponent } from '@components/error-dialog/error-dialog.component';
import { UserProfileDialogComponent } from '@components/user-profile-dialog/user-profile-dialog.component';

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

  joinedChatrooms = new Map<string, boolean>();
  // mainChatroomName: string = 'General';

  @Output()
  chatroomName = new EventEmitter<string>();

  @ViewChild('chatInsert', { read: ViewContainerRef })
  chatInsert!: ViewContainerRef;

  chatComponentFactory: ComponentFactory<ChatComponent>;

  constructor(
    private authService: AuthService,
    private bottomSheetService: MatBottomSheet,
    private chatRoomService: ChatRoomService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private errorDialog: MatDialog,
    private interactionService: InteractionService,
    private socketService: SocketService,
    private teamService: TeamService,
    private windowService: ModalWindowService
  ) {
    this.authenticatedUserId = this.authService.getUserToken();
    this.chatComponentFactory =
      this.componentFactoryResolver.resolveComponentFactory(ChatComponent);
  }

  ngOnInit(): void {
    this.socketService.getAllUsers().subscribe((usersMap) => {
      usersMap.forEach((user) => {
        this.users.push(user);
      });
    });

    this.socketService.getAllTeams().subscribe((teamsMap) => {
      teamsMap.forEach((team) => {
        this.teams.push(team);
      });
    });
  }

  ngAfterViewInit() {
    // user update
    this.socketService.socket!.on('userUpdate', (data: any) => {
      const dataMod: User = JSON.parse(data);
      let found = false;
      this.users.forEach((user) => {
        if (user.id === dataMod.id) {
          user.pseudo = dataMod.pseudo;
          user.status = dataMod.status;
          user.avatar = dataMod.avatar;
          found = true;
        }
      });
      if (!found) {
        this.users.push(dataMod);
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

    this.socketService.socket!.on('teamDeleted', (data: any) => {
      const deletedTeam: Team = JSON.parse(data);
      this.teams.forEach((team) => {
        if (team.id === deletedTeam.id) {
          const index = this.teams.indexOf(team);
          this.teams.splice(index);
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
        // const [mainChatroomName] = this.chatrooms;
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
    this.socketService.socket!.on('cantJoinTeam', (data: any) => {
      const error: { message: string } = JSON.parse(data);
      this.errorDialog.open(ErrorDialogComponent, { data: error.message });
    });

    this.chatInsert.clear();
  }

  joinTeam(team: Team) {
    if (team.visibility === TeamVisibilityLevel.PROTECTED) {
      this.bottomSheetService.open(TeamPasswordBottomSheet, {
        data: { team },
      });
    } else {
      const joinTeamBody: JoinTeam = {
        teamName: team.name!,
        userId: this.authenticatedUserId,
      };
      this.socketService.sendRequestJoinTeam(joinTeamBody);
      this.teamService.requestedTeamToJoin.next(team);
    }
  }

  deleteTeam(team: Team) {
    const deleteTeamBody = { teamId: team.id!, userId: team.ownerId! };
    this.teamService.deleteTeam(deleteTeamBody).subscribe(
      (res) => {
        this.teams.splice(this.teams.indexOf(team), 1);
      },
      (error) => {
        const errorCode = JSON.parse(
          (error as HttpErrorResponse).error
        ).message;
        this.errorDialog.open(ErrorDialogComponent, { data: errorCode });
      }
    );
  }

  leaveTeam(teamName: string) {
    const leaveTeamBodyRequest: LeaveTeam = {
      teamName,
      userId: this.authenticatedUserId,
    };
    this.socketService.leaveTeam(leaveTeamBodyRequest);

    const index = this.chatrooms.indexOf(teamName);
    this.chatrooms.splice(index, 1);
    this.joinedChatrooms.set(teamName, false);

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
    this.interactionService.emitUpdateGallerySignal();
  }

  joinChat(roomName: string) {
    console.log(roomName);
    if (
      this.joinedChatrooms.get(roomName) === false ||
      this.joinedChatrooms.get(roomName) === undefined
    ) {
      this.interactionService.chatRoomName.next(roomName);
      const chatComponent = <ChatComponent>(
        this.chatInsert.createComponent(this.chatComponentFactory).instance
      );
      chatComponent.chatroomName = roomName;
      this.joinedChatrooms.set(roomName, true);
    }
  }

  viewUserProfile(user: User) {
    this.windowService.openDialog(UserProfileDialogComponent, user);
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
