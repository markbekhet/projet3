import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AngularMaterialModule } from './angular-material.module';

import { AuthService } from './services/authentication/auth.service';
import { CanvasBuilderService } from './services/canvas-builder/canvas-builder.service';
import { ChatRoomService } from './services/chat-room/chat-room.service';
import { ColorConvertingService } from './services/color-picker/color-converting.service';
import { ColorPickingService } from './services/color-picker/color-picking.service';
import { DrawingService } from './services/drawing/drawing.service';
import { IconsService } from './services/icons/icons.service';
import { InteractionService } from './services/interaction/interaction.service';
import { ModalWindowService } from './services/window-handler/modal-window.service';
import { SocketService } from './services/socket/socket.service';
import { TeamService } from './services/team/team.service';
import { ValidationService } from './services/validation/validation.service';

import { AppComponent } from './components/app-component/app.component';
import { ChatComponent } from './components/chat-component/chat.component';
import { ColorPickerComponent } from './components/color-picker-component/color-picker.component';
import { CommunicationPageComponent } from './components/communication-page/communication-page.component';
import { DeleteDrawingComponent } from './components/gallery-component/delete-drawing/delete-drawing.component';
import { DrawingViewComponent } from './components/drawing-view/drawing-view.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import {
  DrawingPasswordBottomSheet,
  GalleryComponent,
} from './components/gallery-component/gallery.component';
import { HeaderViewComponent } from './components/drawing-view/header-view/header-view.component';
import { LandingPage } from './components/landing-page/landing-page.component';
import { LoginPage } from './components/login-page/login-page.component';
import { MiniColorPickerComponent } from './components/color-picker-component/mini-color-picker/mini-color-picker.component';
import { ModifyDrawingComponent } from './components/gallery-component/modify-drawing/modify-drawing.component';
import { NewDrawingComponent } from './components/new-drawing-dialog/new-drawing.component';
import { NewTeamDialogComponent } from './components/new-team-dialog/new-team-dialog.component';
import {
  OptionViewComponent,
  ShapeTypePipe,
} from './components/drawing-view/toolbox-view/option-view/option-view.component';
import { ProfilePage } from './components/profile-page/profile-page.component';
import { RegisterPage } from './components/register-page/register-page.component';
import { SvgViewComponent } from './components/drawing-view/svg-view/svg-view.component';
import { ThumbnailComponent } from './components/gallery-component/thumbnail/thumbnail.component';
import { ToolboxViewComponent } from './components/drawing-view/toolbox-view/toolbox-view.component';
import { UserProfileDialogComponent } from './components/user-profile-dialog/user-profile-dialog.component';
import { UserTeamListComponent } from './components/user-team-list/user-team-list.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    ColorPickerComponent,
    CommunicationPageComponent,
    DeleteDrawingComponent,
    DrawingPasswordBottomSheet,
    DrawingViewComponent,
    ErrorDialogComponent,
    GalleryComponent,
    HeaderViewComponent,
    LandingPage,
    LoginPage,
    MiniColorPickerComponent,
    ModifyDrawingComponent,
    NewDrawingComponent,
    NewTeamDialogComponent,
    OptionViewComponent,
    ShapeTypePipe,
    ProfilePage,
    RegisterPage,
    SvgViewComponent,
    ThumbnailComponent,
    ToolboxViewComponent,
    UserProfileDialogComponent,
    UserTeamListComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    FlexLayoutModule,
    AngularMaterialModule,
    FontAwesomeModule,
  ],
  providers: [
    AuthService,
    CanvasBuilderService,
    ChatRoomService,
    ColorConvertingService,
    ColorPickingService,
    DrawingService,
    IconsService,
    InteractionService,
    ModalWindowService,
    SocketService,
    TeamService,
    ValidationService,
  ],
  entryComponents: [
    ErrorDialogComponent,
    NewDrawingComponent,
    NewTeamDialogComponent,
    DeleteDrawingComponent,
    ModifyDrawingComponent,
    GalleryComponent,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

// Note (Paul) :
// - HttpClientModule --> mis dans les providers dans mon projet 2 précédent
