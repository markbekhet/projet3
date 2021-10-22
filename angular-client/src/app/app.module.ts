import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app-component/app.component';
import { CommunicationPageComponent } from './components/communication-page/communication-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { ChatService } from './services/chat.service';
import { AuthService } from './services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DrawViewComponent } from './components/draw-view/draw-view.component';
import { HeaderViewComponent } from './components/draw-view/header-view/header-view.component';
import { ToolboxViewComponent } from './components/draw-view/toolbox-view/toolbox-view.component';
import { SvgViewComponent } from './components/draw-view/svg-view/svg-view.component';
import { InteractionService } from './services/interaction-service/interaction.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';

 

const appRoutes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  //{ path: ':username', component: CommunicationPageComponent },
  { path: 'draw', component: DrawViewComponent},
  { path: '**', component: DrawViewComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    CommunicationPageComponent,
    RegisterPageComponent,
    ErrorDialogComponent,
    DrawViewComponent,
    HeaderViewComponent,
    ToolboxViewComponent,
    SvgViewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  providers: [
    AuthService,
    ChatService,
    InteractionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
