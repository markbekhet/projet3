import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

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
import { OptionViewComponent, ShapeTypePipe } from './components/draw-view/toolbox-view/option-view/option-view.component';
import { InteractionService } from './services/interaction-service/interaction.service';
import { EntryPointComponent } from './components/entry-point/entry-point.component';
import { ModalWindowService } from './services/window-handler/modal-window.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { NewDrawComponent } from './components/new-draw/new-draw.component';
import { CanvasBuilderService } from './services/canvas-builder/canvas-builder.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconsService } from './services/icons/icons.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { MiniColorPickerComponent } from './components/color-picker/mini-color-picker/mini-color-picker.component';


const appRoutes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  //{ path: ':username', component: CommunicationPageComponent },
  { path: 'vue', component: DrawViewComponent},
  { path: '**', component: EntryPointComponent },
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
    EntryPointComponent,
    NewDrawComponent,
    OptionViewComponent,
    ShapeTypePipe,
    ColorPickerComponent,
    MiniColorPickerComponent,
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
    MatSnackBarModule,
    MatGridListModule,
    MatSidenavModule,
    FlexLayoutModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    MatSliderModule,
    MatSlideToggleModule,
    FormsModule,
    MatToolbarModule,
    MatMenuModule,
  ],
  providers: [
    AuthService,
    ChatService,
    InteractionService,
    ModalWindowService,
    CanvasBuilderService,
    IconsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
