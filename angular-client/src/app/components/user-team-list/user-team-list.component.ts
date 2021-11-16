import { Component, OnInit } from '@angular/core';
import { Team } from '@src/app/models/teamsMeta';
import { User } from '@src/app/models/UserMeta';
import { SocketService } from '@src/app/services/socket/socket.service';

@Component({
  selector: 'app-user-team-list',
  templateUrl: './user-team-list.component.html',
  styleUrls: ['./user-team-list.component.scss']
})
export class UserTeamListComponent implements OnInit {

  userList: User[];
  teamList: Team[];
  constructor(private socketService: SocketService) { 
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

}
