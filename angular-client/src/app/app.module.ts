import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { RequestService } from 'src/request.service';
import { CommunicationPageComponent } from './communication-page/communication-page.component';

const appRoutes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'user', component: CommunicationPageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    CommunicationPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    RequestService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
