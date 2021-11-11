import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { UserCredentials } from '@common/user';
import { AuthService } from '@services/authentication/auth.service';
// import { ValidationService } from '@services/validation.service';
import { ErrorDialogComponent } from '@components/error-dialog/error-dialog.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  inputForm: FormGroup;
  usernameExists: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    public errorDialog: MatDialog
  ) {
    this.inputForm = this.formBuilder.group({
      username: formBuilder.control('', [Validators.required]),
      password: formBuilder.control('', [Validators.required]),
    });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}

  // reference https://www.youtube.com/watch?v=R1JWdvD0dv8
  // reference https://www.youtube.com/watch?v=9YuoQrvQ7R8
  // adapted from https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit/
  public async onSubmit(form: FormGroup) {
    const user: UserCredentials = {
      username: form.value.username,
      password: form.value.password,
    };

    try {
      this.auth.login(user).subscribe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (accepted) => {
          // this.router.navigate(['/' + this.username]);
          console.log(`${user.username} is logged in`);
          form.reset();
          this.router.navigate(['/']);
        },
        (error) => {
          const errorCode = JSON.parse(
            (error as HttpErrorResponse).error
          ).message;
          let interfaceErrorCode;
          switch (errorCode) {
            case this.auth.USER_LOGGED_IN:
              interfaceErrorCode =
                'Cet utilisateur est déjà connecté au serveur !';
              break;
            case this.auth.NO_USER_FOUND:
              interfaceErrorCode =
                "Ce nom d'utilisateur ou adresse courriel n'existe pas !";
              break;
            case this.auth.INCORRECT_PASSWORD:
              interfaceErrorCode = 'Le mot de passe est incorrect !';
              break;
            default:
              break;
          }
          this.errorDialog.open(ErrorDialogComponent, {
            data: interfaceErrorCode,
          });
          this.resetForm();
        }
      );
    } catch (e: any) {}
  }

  public checkError(control: string, error: string) {
    return (
      this.inputForm.controls[control].dirty &&
      this.inputForm.controls[control].hasError(error)
    );
  }

  private resetForm() {
    this.inputForm = this.formBuilder.group({
      username: this.formBuilder.control('', [Validators.required]),
      password: this.formBuilder.control('', [Validators.required]),
    });
  }
}
