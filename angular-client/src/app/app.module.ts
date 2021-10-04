import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app-component/app.component';
import { CommunicationPageComponent } from './components/communication-page/communication-page.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { ChatService } from './services/chat.service';
import { RequestService } from './services/request.service';

const appRoutes: Routes = [
  { path: ':username', component: CommunicationPageComponent },
  { path: '**', component: LandingPageComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    CommunicationPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    RequestService,
    ChatService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
