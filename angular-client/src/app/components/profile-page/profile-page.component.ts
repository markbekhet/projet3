import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DrawingInformations } from '@src/app/models/drawing-informations';
import { DrawingState } from '@src/app/models/DrawingMeta';
import {
  Avatar,
  DrawingEditionHistory,
  Status,
  UpdateUserInformation,
  User,
} from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { AvatarService } from '@src/app/services/avatar/avatar.service';
import { DrawingService } from '@src/app/services/drawing/drawing.service';
import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { SocketService } from '@src/app/services/socket/socket.service';
import { ValidationService } from '@src/app/services/validation/validation.service';
import { ModalWindowService } from '@src/app/services/window-handler/modal-window.service';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
})

export class ProfilePage implements OnInit {
  user: User = {
    id: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    status: Status.OFFLINE,
    pseudo: '',
    avatar: '',

    averageCollaborationTime: 0,
    totalCollaborationTime: 0,
    numberCollaborationTeams: 0,
    numberCollaboratedDrawings: 0,
    numberAuthoredDrawings: 0,

    connectionHistories: [],
    disconnectionHistories: [],
    drawingEditionHistories: [],
  };

  updateForm: FormGroup;
  selectedAvatar!: Avatar;
  @ViewChild('file') file!: ElementRef;
  selected: boolean = true;
  avatarSizeTooBig!: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private socketService: SocketService,
    private formBuilder: FormBuilder,
    public errorDialog: MatDialog,
    private interactionService: InteractionService,
    private drawingService: DrawingService,
    private avatarService: AvatarService,
    private windowService: ModalWindowService,
  ) {
    this.socketService.getUserProfile({
      userId: this.auth.token$.value,
      visitedId: this.auth.token$.value,
    });

    this.updateForm = this.formBuilder.group({
      pseudo: formBuilder.control('', [
        Validators.pattern(ValidationService.USERNAME_REGEX),
      ]),
      oldPassword: formBuilder.control('', [
        Validators.pattern(ValidationService.PASSWORD_REGEX),
      ]),
      newPassword: formBuilder.control('', [
        Validators.pattern(ValidationService.PASSWORD_REGEX),
      ]),
      avatar: formBuilder.control('', []),
    });
  }

  @HostListener('window:beforeunload')
  disconnect() {
    if (this.auth.token$.value !== '') {
      this.auth.disconnect();
    }
  }

  ngOnInit(): void {
    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });

    this.socketService
      .getDrawingInformations()
      .subscribe((drawingInformations: DrawingInformations)=>{
        this.interactionService.drawingInformations.next(drawingInformations.drawing);
        this.router.navigate(['/draw']);
      })
  }

  onSubmit(formPseudo: FormGroup) {
    const updates: UpdateUserInformation = {
      newPseudo: this.verifyPseudo(formPseudo.controls.pseudo.value),
      newPassword: this.verifyPassword(
        formPseudo.controls.newPassword.value
      ),
      oldPassword: formPseudo.controls.oldPassword.value,
      newAvatar: formPseudo.controls.avatar.value,
    };

    this.auth.updateUserProfile(updates).subscribe(
      (response) => {
        // success
        this.socketService.updateUserProfile(updates);
      },

      (error) => {
        const errorCode = JSON.parse(
          (error as HttpErrorResponse).error
        ).message;
        console.log(error);
        this.errorDialog.open(ErrorDialogComponent, {
          data: errorCode,
        });
      }
    );
    this.resetForm();
  }

  private verifyPseudo(newPseudo: string) {
    const CURRENT_PSEUDO: string = this.user.pseudo!;
    if (newPseudo === '') return null;
    if (newPseudo === CURRENT_PSEUDO) return null;
    return newPseudo;
  }

  private verifyPassword(newPassword: string) {
    if (newPassword === '') return null;
    return newPassword;
  }

  private resetForm() {
    this.updateForm.reset();
    this.updateForm.controls.newPassword.setValue('');
  }

  decodeAvatar() {
    return this.avatarService.decodeAvatar(this.user.avatar!);
  }

  decodeNewAvatar() {
    return this.avatarService.decodeAvatar(this.updateForm.controls.avatar.value);
  }

  goLaunchingPage() {
    this.router.navigate(['/home']);
  }

  buttonDisabled(form: FormGroup) {
    if (form.controls.newPseudo !== null) {
      const NEW_PSEUDO = form.controls.newPseudo.value;
      const NEW_PASSWORD = form.controls.newPassword.value;
      const OLD_PASSWORD = form.controls.oldPassword.value;
      const NEW_AVATAR = form.controls.avatar.value;
      // pseudo & passwords both empty
      const ALL_CONTROLS_EMPTY =
        NEW_PSEUDO === '' && NEW_PASSWORD === '' && OLD_PASSWORD === '' && NEW_AVATAR === '';
      return ALL_CONTROLS_EMPTY;
    }

    return false; // this.updateForm.controls.newPseudo.value === ''
  }

  public checkError(form: FormGroup, control: string, error: string) {
    return (
      form.controls[control].dirty && form.controls[control].hasError(error)
    );
  }

  public drawingEnabled(drawing: DrawingEditionHistory) {
    return drawing.drawingStae === DrawingState.AVAILABLE;
  }

  public joinDrawing(collaboration: DrawingEditionHistory) {
    const joinDrawing = {
      drawingId: collaboration.drawingId,
      userId: this.auth.token$.value,
      password: undefined,
    };
    this.socketService.sendJoinDrawingRequest(joinDrawing);
    this.drawingService.$drawingId.next(collaboration.drawingId);
    //this.router.navigate(['/home']);
  }

  public mostRecentVersionDrawing(collaboration: DrawingEditionHistory) {
    for (let i = this.user.drawingEditionHistories!.length - 1; i >= 0; i--) {
      const drawing = this.user.drawingEditionHistories![i];
      if (drawing.drawingId === collaboration.drawingId) {
        console.log(`${drawing.date} ${collaboration.date}`);
        return drawing.date === collaboration.date;
      }
    }
    return false;
  }

  selectAvatarOption(option: string, event?: Event) {
    switch(option) {
      case 'selectAvatar':
        this.selected = true;
        this.selectAvatar();
        break;
      case 'uploadAvatar':
        this.selected = false;
        this.uploadAvatar(event);
        break;
    }
  }

  private selectAvatar() {
    const ref = this.windowService.openDialog(AvatarDialogComponent);
    ref!.afterClosed().subscribe(result => {
      const avatar: Avatar = result;
      this.selectedAvatar = avatar;
      console.log(this.selectedAvatar.url);
      this.avatarService.encodeImageFileAsURL(this.selectedAvatar)
      .subscribe(data => {
        const reader = new FileReader();
        reader.readAsDataURL(data);
        reader.onloadend = () => {
          let base64data = reader.result as string;
          base64data = this.avatarService.removeHeader(base64data);
          this.updateForm.controls.avatar.setValue(base64data);
          this.selectedAvatar.encoding = base64data;
        }

      }, error => {
        console.log(error);
      })
    });
  }

  handleClick() {
    this.file.nativeElement.click();
  }

  private uploadAvatar(event: any) {
    const targetFile: File = event.target.files[0];
    this.avatarSizeTooBig = targetFile.size >= 55000;
    if (!this.avatarSizeTooBig) {
      const reader = new FileReader();
    reader.readAsDataURL(targetFile);
    reader.onload = () => {
      let base64data = reader.result as string;
      base64data = this.avatarService.removeHeader(base64data);
      this.updateForm.controls.avatar.setValue(base64data);
      this.selectedAvatar = {
        url: base64data,
        filename: targetFile.name,
        encoding: base64data,
      };
    };
    }
  }
}
