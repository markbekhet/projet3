import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Status, User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { SocketService } from '@src/app/services/socket/socket.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User = {
    token: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    status: Status.OFFLINE,
    pseudo: '',

    averageCollaborationTime: 0,
    totalCollaborationTime: 0,
    numberCollaborationTeams: 0,
    numberCollaboratedDrawings: 0,
    numberAuthoredDrawings: 0,

    connectionHistory: {
      id: 0,
      date: '',
    },
    disconnectionHistory: {
      id: 0,
      date: '',
    },
    drawingEditionHistories: [],
  };

  constructor(
    private router: Router,
    private auth: AuthService,
    private socketService: SocketService
  ) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.socketService.getUserProfile({
      userId: this.auth.token$.value,
      visitedId: this.auth.token$.value,
    });

    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });
  }

  goLaunchingPage() {
    this.router.navigate(['/']);
  }
}
