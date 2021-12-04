import { Injectable } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  // https://medium.com/factory-mind/regex-cookbook-most-wanted-regex-aa721558c3c1
  static readonly USERNAME_REGEX: RegExp = new RegExp(/^[a-zA-Z0-9_-]{3,}$/);
  static readonly EMAIL_REGEX: RegExp = new RegExp(/^\S+@\S+$/);
  static readonly PASSWORD_REGEX: RegExp = new RegExp(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
  );

  static usernameValidator(control: FormControl) {
    if (control.value.match(ValidationService.USERNAME_REGEX)) {
      return null;
    }
    if (control.value.match(ValidationService.EMAIL_REGEX)) {
      return null;
    }
    return { invalidUsername: true };
  }

  static emailValidator(control: FormControl) {
    if (control.value.match(ValidationService.EMAIL_REGEX)) {
      return null;
    }
    return { invalidEmail: true };
  }

  static passwordValidator(control: FormControl) {
    if (control.value.match(ValidationService.PASSWORD_REGEX)) {
      return null;
    }
    return { invalidPassword: true };
  }

  static matchingPasswordValidator(password: string, verificationPassword: string) {
    return (control: AbstractControl) => {
      const passwordValue = control.get(password)!.value;
      const verificationPasswordValue = control.get(verificationPassword)!.value;

      if (passwordValue !== verificationPasswordValue) {
        control.get(verificationPassword)!.setErrors({ fieldsMismatched: true });
      } return null;
    }
  }
}
