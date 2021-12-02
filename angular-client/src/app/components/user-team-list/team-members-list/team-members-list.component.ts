import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActiveUser } from '@src/app/models/active-user';
import { User } from '@src/app/models/UserMeta';
import { AvatarService } from '@src/app/services/avatar/avatar.service';
import { SocketService } from '@src/app/services/socket/socket.service';
import { TeamService } from '@src/app/services/team/team.service';

@Component({
  selector: 'app-team-members-list',
  templateUrl: './team-members-list.component.html',
  styleUrls: ['./team-members-list.component.scss']
})
export class TeamMembersListComponent implements OnInit {

  users: User[];
  bio: string;
  constructor(private teamService: TeamService,
    private socketService: SocketService,
    private avatarService: AvatarService,
    @Inject(MAT_DIALOG_DATA) public teamName: string,){
      this.users =[]
      this.bio = this.teamService.activeTeams.value.get(teamName)!.bio!;
      let activeUsers = this.teamService.activeTeams.value.get(teamName)!.activeUsers;
      activeUsers.forEach((activeUser: ActiveUser) => {
        let user = this.socketService.users$.value.get(activeUser.userId);
        this.users.push(user!);
      }); 
    }

  ngOnInit(): void {
  }

  decodeAvatar(avatarEncoded: string) {
    if (avatarEncoded === undefined) {
      return '';
    }
    return this.avatarService.decodeAvatar(avatarEncoded);
  }
}
