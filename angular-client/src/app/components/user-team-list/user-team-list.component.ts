import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JoinTeam, LeaveTeam } from '@src/app/models/joinTeam';
import { ChatHistory } from '@src/app/models/MessageMeta';
import { Team } from '@src/app/models/teamsMeta';
import { User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { ChatRoomService } from '@src/app/services/chat-room/chat-room.service';
import { InteractionService } from '@src/app/services/interaction/interaction.service';
//import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { SocketService } from '@src/app/services/socket/socket.service';
import { TeamService } from '@src/app/services/team/team.service';

@Component({
  selector: 'app-user-team-list',
  templateUrl: './user-team-list.component.html',
  styleUrls: ['./user-team-list.component.scss']
})
export class UserTeamListComponent implements OnInit, AfterViewInit {

  userList: User[];
  teamList: Team[];
  chatRoomList: string[];
  userId: string;
  constructor(private socketService: SocketService, private authService: AuthService,
     private teamService: TeamService, private readonly chatRoomService: ChatRoomService,
      private router: Router, private interactionService: InteractionService) { 
    this.userList = []
    this.teamList = []
    this.chatRoomList = []
    this.userId = this.authService.token$.value
    
    
  }

  ngOnInit(): void {
    this.socketService.getAllUsers().subscribe((usersMap)=>{
      usersMap.forEach((user)=>{
        this.userList.push(user);
      })
    })

    this.socketService.getAllTeams().subscribe((teamsMap)=>{
      teamsMap.forEach((team)=>{
        this.teamList.push(team);
      })
    })
    console.log(this.userList);
    console.log(this.teamList);
    
  }
  ngAfterViewInit(){
    // user update
    this.socketService.socket!.on("userUpdate", (data: any)=>{
      let dataMod: User = JSON.parse(data);
      let found = false;
      this.userList.forEach((user)=>{
        if(user.id === dataMod.id){
          user.pseudo = dataMod.pseudo;
          user.status = dataMod.status;
          found = true;
        }
      })
      if(!found){
        this.userList.push(dataMod);
      }
    })

    // newTeamCreated
    this.socketService.socket!.on("newTeamCreated", (data: any)=>{
      let newTeam: Team = JSON.parse(data);
      //let found = false;
      /*this.chatRoomList.forEach((chatRoom)=>{
        if(chatRoom.id === newTeam.id){
          found = true;
        }
      })*/
      
      if(this.chatRoomList.indexOf(newTeam.name!) === -1){
        this.teamList.push(newTeam);
      }
    })
    this.socketService.socket!.on("teamDeleted", (data: any)=>{
      let deletedTeam: Team = JSON.parse(data);
      this.teamList.forEach((team)=>{
        if(team.id === deletedTeam.id){
          let index = this.teamList.indexOf(team);
          this.teamList.splice(index);
        }
      })
    })

    // teamJoined
    this.socketService.socket!.on("teamInformations", (data: any)=>{
      let teamInformations: {chatHistoryList: ChatHistory[]} = JSON.parse(data);
      let requestedTeam = this.teamService.requestedTeamToJoin.value;
      this.teamService.activeTeams.value.set(requestedTeam.name!, requestedTeam)
      this.chatRoomService.addChatRoom(requestedTeam.name!, teamInformations.chatHistoryList);
      this.chatRoomList.push(requestedTeam.name!);
      let index = this.teamList.indexOf(requestedTeam)
      if(index !==-1){
        this.teamList.splice(index);
      }
    })

    console.log(this.chatRoomService.chatRooms.keys())
    for(let key of this.chatRoomService.chatRooms.keys()){
      this.chatRoomList.push(key);
    }
  }

  joinTeam(team: Team){
    const joinTeamBody: JoinTeam = {teamName: team.name!, userId: this.userId};
    this.socketService.sendRequestJoinTeam(joinTeamBody);
    this.teamService.requestedTeamToJoin.next(team);
  }
  deleteTeam(team:Team){
    const deleteTeamBody = {teamId: team.id!, userId: team.ownerId!};
    this.teamService.deleteTeam(deleteTeamBody);

  }

  leaveTeam(teamName:string){
    const leaveTeamBodyRequest: LeaveTeam ={teamName: teamName, userId: this.userId}
    this.socketService.leaveTeam(leaveTeamBodyRequest);
    let index = this.chatRoomList.indexOf(teamName);
    this.chatRoomList.splice(index);
    this.teamList.push(this.teamService.activeTeams.value.get(teamName)!);
    this.teamService.activeTeams.value.delete(teamName)
  }

  joinChat(roomName: string){
    console.log(roomName);
    this.interactionService.chatRoomName.next(roomName)
    this.router.navigate(['/chat'])
  }
}
