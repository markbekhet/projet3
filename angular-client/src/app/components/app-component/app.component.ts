import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '@src/app/services/authentication/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  title = 'angular-client';
  constructor(private authService: AuthService){}

  ngOnDestroy(): void {
    if(this.authService.token$.value !== ""){
      this.authService.disconnect();
    }
  }
}
