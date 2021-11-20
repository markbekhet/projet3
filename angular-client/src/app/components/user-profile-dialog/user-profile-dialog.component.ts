import { Component, OnInit } from '@angular/core';
//import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { SocketService } from '@src/app/services/socket/socket.service';

@Component({
  selector: 'app-user-profile-dialog',
  templateUrl: './user-profile-dialog.component.html',
  styleUrls: ['./user-profile-dialog.component.scss']
})
export class UserProfileDialogComponent implements OnInit {
  visitedUser: User = {
    pseudo: ''
  };

  constructor(
    private auth: AuthService,
    private socketService: SocketService,
    //private windowService: ModalWindowService,
    ) {}

  ngOnInit(): void {

  }

  receiveUserInfo(visitedId: string) {
    this.socketService.getUserProfile({
      userId: this.auth.token$.value,
      visitedId: visitedId,
    });

    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.visitedUser = profile;
    });
  }
}
