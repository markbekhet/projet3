import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingPage } from './components/landing-page/landing-page.component';
import { LoginPage } from './components/login-page/login-page.component';
import { RegisterPage } from './components/register-page/register-page.component';
import { DrawingViewComponent } from './components/drawing-view/drawing-view.component';
import { ProfilePage } from './components/profile-page/profile-page.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
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
// "The wildcard route will match any path. It is built using ** and will be used to handle non-existing paths in the application. It is called if the second Path does not match by placing a wildcard route at the end of the configuration."
// { path: '**', component: LandingPageComponent },
// Could be used for a 404 page for example.
// But we won't need it since we're using Electron, which causes that the user doesn't have access to the url bar.
// Therefore it is important to understand that we can't rely on in-browser navigation with routes, therefore we rely solely on the app's flow and the built-in app navigation that we create.
