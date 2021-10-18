import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

import { ValidationService } from 'src/app/services/validation.service';
import { UserCredentials } from '../../../../../common/user';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  inputForm: FormGroup;
  usernameExists: boolean = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.inputForm = this.formBuilder.group({
      username: formBuilder.control('', [ Validators.required, ValidationService.usernameValidator ]),
      password: formBuilder.control('', [ Validators.required ])
    });
  }

  ngOnInit(): void {}

  // reference https://www.youtube.com/watch?v=R1JWdvD0dv8
  // reference https://www.youtube.com/watch?v=9YuoQrvQ7R8
  // adapted from https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit/
  public async onSubmit(form: FormGroup) {
    const user: UserCredentials = {
      username: form.value['username'],
      password: form.value['password'],
    };
    
    try {
      this.auth.login(user)
        .subscribe(
          accepted => {
            //this.router.navigate(['/' + this.username]);
            console.log(user.username + ' is logged in');
          },
          error => {
            console.log(error);
          }
        )
      
    } catch(e: any) {

    }
  }

  public checkError(control: string, error: string) {
    return this.inputForm.controls[control].dirty && 
    this.inputForm.controls[control].hasError(error);
  }
}
