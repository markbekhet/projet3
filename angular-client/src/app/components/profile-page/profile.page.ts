import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Status, UpdateUserInformation, User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { SocketService } from '@src/app/services/socket/socket.service';
// import { ValidationService } from '@src/app/services/validation/validation.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User = {
    token: '',
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

    connectionHistory: {
      id: 0,
      date: '',
    },
    disconnectionHistory: {
      id: 0,
      date: '',
    },
    drawingEditionHistories: [],
  };

  updateForm: FormGroup;

  constructor(
    private router: Router,
    private auth: AuthService,
    private socketService: SocketService,
    private formBuilder: FormBuilder
  ) {
    this.socketService.getUserProfile({
      userId: this.auth.token$.value,
      visitedId: this.auth.token$.value,
    });

    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });

    this.updateForm = this.formBuilder.group({
      pseudo: formBuilder.control(this.user.pseudo, []),
      oldPassword: formBuilder.control('', []),
      newPassword: formBuilder.control('', []),
    });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}

  async onSubmit(formPseudo: FormGroup) {
    alert("we're ready to submit any changes");
    let updates: UpdateUserInformation = {
      newPseudo: this.verifyPseudo(this.updateForm.controls.pseudo.value),
      newPassword: this.verifyPassword(this.updateForm.controls.newPassword.value),
      oldPassword: this.updateForm.controls.oldPassword.value,
    }

    this.auth.updateUserProfile(updates).subscribe(
      (response) => {
        //success
        console.log(`Profil update success ${response}`);
        this.socketService.updateUserProfile(updates);

      },
      (error) => {
        console.log(error);
      }
    )
  }

  private verifyPseudo(newPseudo: string) {
    const CURRENT_PSEUDO: string = this.user.pseudo;
    if (newPseudo === '') return undefined;
    if (newPseudo === CURRENT_PSEUDO) return undefined;
    return newPseudo;
  }

  private verifyPassword(newPassword: string) {
    const CURRENT_PASSWORD: string = this.user.password;
    if (newPassword === '') return undefined;
    if (newPassword === CURRENT_PASSWORD) return undefined;
    return newPassword;
  }

  goLaunchingPage() {
    this.router.navigate(['/']);
  }

  public checkError(form: FormGroup, control: string, error: string) {
    return (
      form.controls[control].dirty &&
      form.controls[control].hasError(error)
    );
  }
}
