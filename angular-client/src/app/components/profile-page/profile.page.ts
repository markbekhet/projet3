import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User = {
    token: '',
  };

  constructor(private router: Router, private auth: AuthService) {
    this.auth.getProfile().subscribe((user) => {
      this.user = user;
    });
    console.log('construction');
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.auth.getProfile().subscribe((user) => {
      this.user = user;
    });
    console.log('on init');
  }

  goLaunchingPage() {
    this.router.navigate(['/']);
  }
}
