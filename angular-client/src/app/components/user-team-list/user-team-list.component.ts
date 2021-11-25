/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';

import { JoinTeam, LeaveTeam } from '@models/joinTeam';
//import { ChatHistory } from '@models/MessageMeta';
import { Team } from '@models/teamsMeta';
import { User } from '@models/UserMeta';
import { AuthService } from '@services/authentication/auth.service';
import { ChatRoomService } from '@services/chat-room/chat-room.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';
import { TeamService } from '@services/team/team.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { UserProfileDialogComponent } from '@components/user-profile-dialog/user-profile-dialog.component';
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TeamVisibilityLevel } from '@src/app/models/VisibilityMeta';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-team-list',
  templateUrl: './user-team-list.component.html',
  styleUrls: ['./user-team-list.component.scss'],
})
export class UserTeamListComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  teams: Team[] = [];
  chatrooms: string[] = [];
  authenticatedUserId: string;

  @Output()
  chatroomName = new EventEmitter<string>();

  constructor(
    private authService: AuthService,
    private readonly chatRoomService: ChatRoomService,
    private interactionService: InteractionService,
    private router: Router,
    private socketService: SocketService,
    private teamService: TeamService,
    private windowService: ModalWindowService,
    private bottomSheetService: MatBottomSheet,
    private errorDialog: MatDialog,
  ) {
    this.authenticatedUserId = this.authService.getUserToken();
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

    console.log(this.users);
    console.log(this.teams);
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
    this.interactionService.$updateChatListSignal.subscribe((sig: boolean)=>{
      if(sig){
        this.chatrooms = [];
        let roomNames = this.chatRoomService.chatRooms.keys();
        for(let roomName of roomNames){
          this.chatrooms.push(roomName);
        }
        //let teamFound = false;
        this.chatrooms.forEach((room: string)=>{
          this.teams.forEach((team:Team)=>{
            if(team.name! === room){
              this.teams.splice(this.teams.indexOf(team), 1)
            }
          })
        })
      }
    })

    console.log(this.chatRoomService.chatRooms.keys());
    for (const key of this.chatRoomService.chatRooms.keys()) {
      this.chatrooms.push(key);
    }

    this.socketService.socket!.on("cantJoinTeam", (data: any)=>{
      let error: {message: string} = JSON.parse(data);
      this.errorDialog.open(ErrorDialogComponent, {data: error.message});
    })
  }

  joinTeam(team: Team) {
    if(team.visibility === TeamVisibilityLevel.PROTECTED){
      this.bottomSheetService.open(TeamPasswordBottomSheet, {
        data:{team: team}
      })
    }
    else{
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
    this.teamService.deleteTeam(deleteTeamBody).subscribe((resp)=>{
      this.teams.splice(this.teams.indexOf(team), 1)
    },
    (error)=>{
      const errorCode = JSON.parse((error as HttpErrorResponse).error).message;
      this.errorDialog.open(ErrorDialogComponent, {data: errorCode});
    });
  }

  leaveTeam(teamName: string) {
    const leaveTeamBodyRequest: LeaveTeam = {
      teamName,
      userId: this.authenticatedUserId,
    };
    this.socketService.leaveTeam(leaveTeamBodyRequest);
    const index = this.chatrooms.indexOf(teamName);
    this.chatrooms.splice(index, 1);
    let activeTeam = this.teamService.activeTeams.value.get(teamName)!
    let team: Team = {id: activeTeam.id, name: activeTeam.name, visibility: activeTeam.visibility, bio: activeTeam.bio, ownerId: activeTeam.ownerId}
    this.teams.push(team);
    this.teamService.leftTeamId.next(this.teamService.activeTeams.value.get(teamName)!.id);
    this.teamService.activeTeams.value.delete(teamName);
    this.chatRoomService.chatRooms.delete(teamName);
    this.interactionService.emitUpdateGallerySignal();
  }

  joinChat(roomName: string) {
    console.log(roomName);
    this.interactionService.chatRoomName.next(roomName);
    this.router.navigate(['/chat']);
  }

  viewUserProfile(user: User) {
    this.windowService.openDialog(UserProfileDialogComponent, user);
  }
}

@Component({
  selector: 'app-drawing-password-bottom-sheet',
  templateUrl: './team-password/team-password.component.html',
  styleUrls: ['./team-password/team-password.component.scss'],
})
export class TeamPasswordBottomSheet {
  password: string = "";
  userId: string;
  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private teamService: TeamService,
    private bottomSheetRef: MatBottomSheetRef<TeamPasswordBottomSheet>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    private infos:{team: Team}
  ){
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
