import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DrawingInformations } from '@src/app/models/drawing-informations';
import { DrawingState, DrawingVisibility } from '@src/app/models/DrawingMeta';
import {
  ConnectionHistory,
  DrawingEditionHistory,
  Status,
  UpdateUserInformation,
  User,
} from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { DrawingService } from '@src/app/services/drawing/drawing.service';
import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { SocketService } from '@src/app/services/socket/socket.service';
import { ValidationService } from '@src/app/services/validation/validation.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { DrawingPasswordBottomSheet } from '../gallery-component/gallery.component';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private socketService: SocketService,
    private formBuilder: FormBuilder,
    public errorDialog: MatDialog,
    private interactionService: InteractionService,
    private drawingService: DrawingService,
    private bottomSheetService: MatBottomSheet
  ) {
    this.socketService.getUserProfile({
      userId: this.authService.getUserToken(),
      visitedId: this.authService.getUserToken(),
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
    });
  }

  @HostListener('window:beforeunload')
  disconnect() {
    if (this.authService.getUserToken() !== '') {
      this.authService.disconnect();
    }
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });

    console.log((this.user.connectionHistories as ConnectionHistory[]).length);

    this.socketService
      .getDrawingInformations()
      .subscribe((drawingInformations: DrawingInformations) => {
        this.interactionService.drawingInformations.next(
          drawingInformations.drawing
        );
        this.router.navigate(['/draw']);
      });
  }

  onSubmit(formPseudo: FormGroup) {
    const updates: UpdateUserInformation = {
      newPseudo: this.verifyPseudo(this.updateForm.controls.pseudo.value),
      newPassword: this.verifyPassword(
        this.updateForm.controls.newPassword.value
      ),
      oldPassword: this.updateForm.controls.oldPassword.value,
    };

    this.authService.updateUserProfile(updates).subscribe(
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

  backToLandingPage() {
    /* this.auth.disconnect().subscribe((token) => {
      console.log('disconnect successful');
      this.router.navigate(['/login']);
    }, (error) => {
      console.log(error);
    });
*/
    this.router.navigate(['/home']);
  }

  buttonDisabled(form: FormGroup) {
    if (form.controls.newPseudo !== null) {
      const NEW_PSEUDO = form.controls.newPseudo.value;
      const NEW_PASSWORD = form.controls.newPassword.value;
      const OLD_PASSWORD = form.controls.oldPassword.value;
      // pseudo & passwords both empty
      const PSEUDO_PASSWORD_BOTH_EMPTY =
        NEW_PSEUDO === '' && NEW_PASSWORD === '' && OLD_PASSWORD === '';
      return PSEUDO_PASSWORD_BOTH_EMPTY;
    }

    //
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
    if(collaboration.drawingVisibility === DrawingVisibility.PROTECTED){
      this.bottomSheetService.open(DrawingPasswordBottomSheet,{
        data: {drawingId: collaboration.drawingId}
      })
    }
    else{
      const joinDrawing = {
        drawingId: collaboration.drawingId,
        userId: this.authService.getUserToken(),
        password: undefined,
      };
      this.socketService.sendJoinDrawingRequest(joinDrawing);
      this.drawingService.drawingId$.next(collaboration.drawingId);
    } 
    // this.router.navigate(['/home']);
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
}
