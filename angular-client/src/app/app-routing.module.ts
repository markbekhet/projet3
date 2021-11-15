import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingPage } from './components/landing-page/landing.page';
import { LoginPage } from './components/login-page/login.page';
import { RegisterPage } from './components/register-page/register.page';
import { DrawingViewComponent } from './components/drawing-view/drawing-view.component';
import { ProfilePage } from './components/profile-page/profile.page';

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: LandingPage },
  { path: 'draw', component: DrawingViewComponent },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'profile', component: ProfilePage },
  // { path: ':username', component: CommunicationPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

// Note (Paul) : route présente avant le bugfix
// { path: '**', component: LandingPageComponent },
