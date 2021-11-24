/* eslint-disable no-param-reassign */
import {
  AfterViewInit,
  Component,
  EventEmitter,
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
    private windowService: ModalWindowService
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
  }

  joinTeam(team: Team) {
    const joinTeamBody: JoinTeam = {
      teamName: team.name!,
      userId: this.authenticatedUserId,
    };
    this.socketService.sendRequestJoinTeam(joinTeamBody);
    this.teamService.requestedTeamToJoin.next(team);
  }

  deleteTeam(team: Team) {
    const deleteTeamBody = { teamId: team.id!, userId: team.ownerId! };
    this.teamService.deleteTeam(deleteTeamBody);
  }

  leaveTeam(teamName: string) {
    const leaveTeamBodyRequest: LeaveTeam = {
      teamName,
      userId: this.authenticatedUserId,
    };
    this.socketService.leaveTeam(leaveTeamBodyRequest);
    const index = this.chatrooms.indexOf(teamName);
    this.chatrooms.splice(index, 1);

    this.teams.push(this.teamService.activeTeams.value.get(teamName)!);
    this.teamService.leftTeamGallery.next(this.teamService.activeTeams.value.get(teamName)!.gallery!);
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
