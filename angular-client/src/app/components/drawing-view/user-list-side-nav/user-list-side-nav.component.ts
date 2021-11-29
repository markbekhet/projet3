import { AfterViewInit, Component, OnInit } from '@angular/core';
import { User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { AvatarService } from '@src/app/services/avatar/avatar.service';
import {userColorMap } from '@src/app/services/drawing/drawing.service';
import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { SocketService } from '@src/app/services/socket/socket.service';

@Component({
  selector: 'app-user-list-side-nav',
  templateUrl: './user-list-side-nav.component.html',
  styleUrls: ['./user-list-side-nav.component.scss']
})
export class UserListSideNavComponent implements OnInit, AfterViewInit {

  users: {color: string, info: User}[] =[]

  authenticatedUserId: string;

  constructor(private socketService: SocketService, private authService: AuthService, private interactionService:InteractionService, private avatarService: AvatarService) {
    this.authenticatedUserId = this.authService.token$.value
    this.users = [];
  }

  ngOnInit(): void {
    let activeUsers = this.interactionService.currentDrawingActiveUsers.value;
    activeUsers.forEach((activeUser)=>{
      let user = this.socketService.users$.value.get(activeUser.userId);
      console.log(user)
      for(let entry of userColorMap){
        if(entry[1] === undefined){
          this.users.push({color: entry[0], info:user!})
          userColorMap.set(entry[0], activeUser.userId);
          break;
        }
      }
    })
  }
  ngAfterViewInit():void{
    this.socketService.socket!.on("newJoinToDrawing", (data: any)=>{
      let dataMod: {drawingId: number, userId: string} = JSON.parse(data);
      //let mapEntries = userColorMap.entries();
      let user = this.socketService.users$.value.get(dataMod.userId);
      console.log(user);
      for(let entry of userColorMap){
        if(entry[1] === undefined){
          this.users.push({color: entry[0], info:user!})
          userColorMap.set(entry[0], dataMod.userId);
          break;
        }
      }
    })

    this.socketService.socket!.on("userLeftDrawing", (data: any)=>{
      let dataMod: {drawingId: number, userId: string} = JSON.parse(data);
      //let mapEntries = userColorMap.entries();
      for(let entry of userColorMap){
        if(entry[1] === dataMod.userId){
          userColorMap.set(entry[0], undefined)
          break;
        }
      }
      this.users.forEach(user=>{
        if(user.info.id! === dataMod.userId){
          this.users.splice(this.users.indexOf(user), 1);
        }
      })
    })
  }

  decodeAvatar(avatarEncoded: string){
    console.log(avatarEncoded)
    if(avatarEncoded === undefined){
      return "";
    }
    return this.avatarService.decodeAvatar(avatarEncoded);
  }
}
