import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { UserRegistrationInfo } from '@common/user';
import { AuthService } from '@services/authentication/auth.service';
import { ValidationService } from '@services/validation/validation.service';
import { ErrorDialogComponent } from '@components/error-dialog/error-dialog.component';
import { Avatar, avatarList } from '@src/app/models/UserMeta';
import { ModalWindowService } from '@src/app/services/window-handler/modal-window.service';
import { AvatarService } from '@src/app/services/avatar/avatar.service';
import { AvatarDialogComponent } from '../avatar-dialog/avatar-dialog.component';

@Component({
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  avatarList: Avatar[];
  selectedAvatar!: Avatar | null;
  @ViewChild('file') file!: ElementRef;
  selected: boolean = true;
  avatarSizeTooBig!: boolean;

  constructor(
    private auth: AuthService,
    public errorDialog: MatDialog,
    private formBuilder: FormBuilder,
    private router: Router,
    private windowService: ModalWindowService,
    private avatarService: AvatarService
  ) {
    this.avatarList = avatarList;
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
      verificationPassword: formBuilder.control('', [
        Validators.required,
      ]),
      avatar: formBuilder.control('', [
        Validators.required,
      ]),
    });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}

  public async onSubmit(form: FormGroup) {
    console.log(form.value);

    let user: UserRegistrationInfo = {
      firstName: form.controls.firstName.value,
      lastName: form.controls.lastName.value,
      pseudo: form.controls.username.value,
      emailAddress: form.controls.email.value,
      password: form.controls.password.value,
      avatar: form.controls.avatar.value,
    };

    if (form.controls.password.value !== form.controls.verificationPassword.value) {
      user.password = '';
      this.resetForm();
    }

    try {
      this.auth.register(user).subscribe(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (token) => {
          this.router.navigate(['/home']);
        },
        (error) => {
          const errorCode = JSON.parse(
            (error as HttpErrorResponse).error
          ).message;
          console.log(error);
          this.errorDialog.open(ErrorDialogComponent, {
            data: errorCode,
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

  public checkPasswords() {
    return this.registerForm.controls.password.value === this.registerForm.controls.verificationPassword.value;
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
      verificationPassword: this.formBuilder.control('', [
        Validators.required,
      ]),
      avatar: this.formBuilder.control('', [
        Validators.required
      ]),
    });
    this.selectedAvatar = null;
  }

  selectAvatarOption(option: string, event?: Event) {
    switch (option) {
      case 'selectAvatar':
        this.selected = true;
        this.selectAvatar();
        break;
      case 'uploadAvatar':
        this.selected = false;
        this.uploadAvatar(event);
        break;
      default:
        break;
    }
  }

  private selectAvatar() {
    const ref = this.windowService.openDialog(AvatarDialogComponent);
    ref!.afterClosed().subscribe((result) => {
      const avatar: Avatar = result;
      this.selectedAvatar = avatar;
      console.log(this.selectedAvatar.url);
      this.avatarService.encodeImageFileAsURL(this.selectedAvatar).subscribe(
        (data) => {
          const reader = new FileReader();
          reader.readAsDataURL(data);
          reader.onloadend = () => {
            let base64data = reader.result as string;
            base64data = this.avatarService.removeHeader(base64data);
            this.registerForm.controls.avatar.setValue(base64data);
            this.selectedAvatar!.encoding = base64data;
          };
        },
        (error) => {
          console.log(error);
        }
      );
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
        this.registerForm.controls.avatar.setValue(base64data);
        this.selectedAvatar = {
          url: base64data,
          filename: targetFile.name,
          encoding: base64data,
        };
      };
    }
  }

  decodeAvatar() {
    return this.avatarService.decodeAvatar(this.selectedAvatar!.encoding!);
  }
}
