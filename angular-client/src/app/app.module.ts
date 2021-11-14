import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AngularMaterialModule } from './angular-material.module';

import { AuthService } from './services/authentication/auth.service';
import { CanvasBuilderService } from './services/canvas-builder/canvas-builder.service';
import { ColorConvertingService } from './services/color-picker/color-converting.service';
import { ColorPickingService } from './services/color-picker/color-picking.service';
import { DrawingService } from './services/drawing/drawing.service';
import { IconsService } from './services/icons/icons.service';
import { InteractionService } from './services/interaction/interaction.service';
import { ModalWindowService } from './services/window-handler/modal-window.service';
import { SocketService } from './services/socket/socket.service';
import { ValidationService } from './services/validation/validation.service';

import { AppComponent } from './components/app-component/app.component';
import { ColorPickerComponent } from './components/color-picker-component/color-picker.component';
import { CommunicationPageComponent } from './components/communication-page/communication-page.component';
import { DrawingViewComponent } from './components/drawing-view/drawing-view.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { GalleryComponent } from './components/gallery-component/gallery.component';
import { HeaderViewComponent } from './components/drawing-view/header-view/header-view.component';
import { LandingPage } from './components/landing-page/landing-page.component';
import { LoginPage } from './components/login-page/login-page.component';
import { MiniColorPickerComponent } from './components/color-picker-component/mini-color-picker/mini-color-picker.component';
import { NewDrawingComponent } from './components/new-drawing-dialog/new-drawing.component';
import {
  OptionViewComponent,
  ShapeTypePipe,
} from './components/drawing-view/toolbox-view/option-view/option-view.component';
import { ProfilePage } from './components/profile-page/profile-page.component';
import { RegisterPage } from './components/register-page/register-page.component';
import { SvgViewComponent } from './components/drawing-view/svg-view/svg-view.component';
import { ToolboxViewComponent } from './components/drawing-view/toolbox-view/toolbox-view.component';

@NgModule({
  declarations: [
    AppComponent,
    ColorPickerComponent,
    CommunicationPageComponent,
    DrawingViewComponent,
    ErrorDialogComponent,
    GalleryComponent,
    HeaderViewComponent,
    LandingPage,
    LoginPage,
    MiniColorPickerComponent,
    NewDrawingComponent,
    OptionViewComponent,
    ProfilePage,
    RegisterPage,
    ShapeTypePipe,
    SvgViewComponent,
    ToolboxViewComponent,
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
  ],
  providers: [
    AuthService,
    CanvasBuilderService,
    ColorConvertingService,
    ColorPickingService,
    DrawingService,
    IconsService,
    InteractionService,
    ModalWindowService,
    SocketService,
    ValidationService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

// Note (Paul) :
// - HttpClientModule --> mis dans les providers dans mon projet 2 précédent
// - entryComponents: [LandingPageComponent, DrawingViewComponent] --> à mettre après les providers,
// peut être utile pour les modales.
