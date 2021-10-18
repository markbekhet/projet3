import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  //https://medium.com/factory-mind/regex-cookbook-most-wanted-regex-aa721558c3c1
  static readonly USERNAME_REGEX: RegExp = new RegExp(/^[a-zA-Z0-9_-]{3,}$/);
  static readonly EMAIL_REGEX: RegExp = new RegExp(/^\S+@\S+$/);
  static readonly PASSWORD_REGEX: RegExp = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
  
  constructor() { }
  
  static usernameValidator(control: FormControl) {
    if (control.value.match(ValidationService.USERNAME_REGEX)) {
      return null;
    } else if (control.value.match(ValidationService.EMAIL_REGEX)) {
      return null;
    } else {
      return { invalidUsername: true };
    }
  }

  static emailValidator(control: FormControl) {
    if (control.value.match(ValidationService.EMAIL_REGEX)) {
      return null;
    } else {
      return { invalidEmail: true };
    }
  }

  static passwordValidator(control: FormControl) {
    if (control.value.match(ValidationService.PASSWORD_REGEX)) {
      return null;
    } else {
      return { invalidPassword: true };
    }
  }
}
