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
import { ChatService } from './services/chat/chat.service';
import { ColorConvertingService } from './services/colorPicker/color-converting.service';
import { ColorPickingService } from './services/colorPicker/color-picking.service';
import { IconsService } from './services/icons/icons.service';
import { InteractionService } from './services/interaction-service/interaction.service';
import { ModalWindowService } from './services/window-handler/modal-window.service';

import { AppComponent } from './components/app-component/app.component';
import { CommunicationPageComponent } from './components/communication-page/communication-page.component';
import { DrawingViewComponent } from './components/drawing-view/drawing-view.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { HeaderViewComponent } from './components/drawing-view/header-view/header-view.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { MiniColorPickerComponent } from './components/mini-color-picker/mini-color-picker.component';
import { NewDrawingComponent } from './components/new-drawing-dialog/new-drawing.component';
import { OptionViewComponent } from './components/drawing-view/toolbox-view/option-view/option-view.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { SvgViewComponent } from './components/drawing-view/svg-view/svg-view.component';
import { ToolboxViewComponent } from './components/drawing-view/toolbox-view/toolbox-view.component';

@NgModule({
  declarations: [
    AppComponent,
    CommunicationPageComponent,
    DrawingViewComponent,
    ErrorDialogComponent,
    HeaderViewComponent,
    LandingPageComponent,
    LoginPageComponent,
    MiniColorPickerComponent,
    NewDrawingComponent,
    OptionViewComponent,
    RegisterPageComponent,
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
    ChatService,
    ColorConvertingService,
    ColorPickingService,
    IconsService,
    InteractionService,
    ModalWindowService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

// Note (Paul) :
// - HttpClientModule --> mis dans les providers dans mon projet 2 précédent
// - entryComponents: [LandingPageComponent, DrawingViewComponent] --> à mettre après les providers,
// peut être utile pour les modales.
