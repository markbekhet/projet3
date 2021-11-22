import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { Status, User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { SocketService } from '@src/app/services/socket/socket.service';

@Component({
  selector: 'app-user-profile-dialog',
  templateUrl: './user-profile-dialog.component.html',
  styleUrls: ['./user-profile-dialog.component.scss'],
})
export class UserProfileDialogComponent implements OnInit {
  visitedUser: User = {
    pseudo: '',
    status: Status.ONLINE,
  };

  constructor(
    private auth: AuthService,
    private socketService: SocketService,
    // private windowService: ModalWindowService,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    const visitedUserData = data as User;
    console.log(visitedUserData.id);
    this.socketService.getUserProfile({
      userId: this.auth.getUserToken(),
      visitedId: visitedUserData.id!,
    });
  }

  ngOnInit(): void {
    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.visitedUser = profile;
    });
  }
}
