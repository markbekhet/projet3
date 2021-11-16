import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Team } from '@src/app/models/teamsMeta';
import { User } from '@src/app/models/UserMeta';
//import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { SocketService } from '@src/app/services/socket/socket.service';

@Component({
  selector: 'app-user-team-list',
  templateUrl: './user-team-list.component.html',
  styleUrls: ['./user-team-list.component.scss']
})
export class UserTeamListComponent implements OnInit, AfterViewInit {

  userList: User[];
  teamList: Team[];
  constructor(private socketService: SocketService/*, private interactionService: InteractionService*/) { 
    this.userList = []
    this.teamList = []
    
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
    this.socketService.socket!.on("userUpdate", (data: any)=>{
      let dataMod: User = JSON.parse(data);
      let found = false;
      this.userList.forEach((user)=>{
        if(user.id === dataMod.id){
          user = dataMod;
          found = true;
        }
      })
      if(!found){
        this.userList.push(dataMod);
      }
    })
  }

}
