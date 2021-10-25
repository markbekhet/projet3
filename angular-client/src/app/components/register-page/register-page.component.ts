import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ValidationService } from 'src/app/services/validation.service';

import { UserRegistrationInfo } from '../../../../../common/user';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    public errorDialog: MatDialog
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: formBuilder.control('', [Validators.required]),
      lastName: formBuilder.control('', [Validators.required]),
      username: formBuilder.control('', [
        Validators.required,
        ValidationService.usernameValidator,
      ]),
      email: formBuilder.control('', [
        Validators.required,
        ValidationService.emailValidator,
      ]),
      password: formBuilder.control('', [
        Validators.required,
        ValidationService.passwordValidator,
      ]),
      avatar: formBuilder.control('', []),
    });
  }

  ngOnInit(): void {}

  public async onSubmit(form: FormGroup) {
    console.log(form.value);

    const user: UserRegistrationInfo = {
      firstName: form.controls.firstName.value,
      lastName: form.controls.lastName.value,
      pseudo: form.controls.username.value,
      emailAddress: form.controls.email.value,
      password: form.controls.password.value,
    };

    try {
      this.auth.register(user).subscribe(
        (token) => {
          console.log(this.auth.authentifiedUser);
          // this.router.navigate(['/' + user.pseudo]);
        },
        (error) => {
          const errorCode = JSON.parse(
            (error as HttpErrorResponse).error
          ).message;
          console.log(errorCode);
          let interfaceErrorCode;
          switch (errorCode) {
            case this.auth.DUPLICATE_EMAIL:
              interfaceErrorCode = 'Un compte avec ce courriel existe déjà !';
              break;
            case this.auth.DUPLICATE_USERNAME:
              interfaceErrorCode =
                "Un compte avec ce nom d'utilisateur existe déjà !";
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
    } catch (e) {}
  }

  public checkError(control: string, error: string) {
    return (
      this.registerForm.controls[control].dirty &&
      this.registerForm.controls[control].hasError(error)
    );
  }

  private resetForm() {
    this.registerForm = this.formBuilder.group({
      firstName: this.formBuilder.control('', [Validators.required]),
      lastName: this.formBuilder.control('', [Validators.required]),
      username: this.formBuilder.control('', [
        Validators.required,
        ValidationService.usernameValidator,
      ]),
      email: this.formBuilder.control('', [
        Validators.required,
        ValidationService.emailValidator,
      ]),
      password: this.formBuilder.control('', [
        Validators.required,
        ValidationService.passwordValidator,
      ]),
      avatar: this.formBuilder.control('', []),
    });
  }
}
