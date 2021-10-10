import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from 'Colorimage-win32-x64/resources/app/node_modules/@angular/common/http';
import { RequestService } from 'src/app/services/request.service';
import { ValidationService } from 'src/app/services/validation.service';

import { UserRegistrationInfo } from '../../../../../common/user';  

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private request: RequestService) {
      this.registerForm = this.formBuilder.group({
        firstName: formBuilder.control('', [ Validators.required ]),
        lastName: formBuilder.control('', [ Validators.required ]),
        username: formBuilder.control('', [ Validators.required, ValidationService.usernameValidator ]),
        email: formBuilder.control('', [ Validators.required, ValidationService.emailValidator ]),
        password: formBuilder.control('', [ Validators.required, ValidationService.passwordValidator ]),
        avatar: formBuilder.control('', [ Validators.required ])
      });
    }

  ngOnInit(): void {
    
  }

  public async onSubmit(form: FormGroup) {
    console.log(form.value);

    let user: UserRegistrationInfo = {
      firstName: form.controls['firstName'].value,
      lastName: form.controls['lastName'].value,
      pseudo: form.controls['username'].value,
      emailAddress: form.controls['email'].value,
      password: form.controls['password'].value
    }

    try {
      this.request.register(user)
        .subscribe(
          token => {
            console.log(token);
            console.log(user.pseudo + ' created in DB');
            //this.router.navigate(['/' + this.username]);
          },
          error => {
            console.log((error as HttpErrorResponse));
            console.log((error as HttpErrorResponse).message);
          }
        )
      
    } catch(e: any) {

    }

    
  }

  public checkError(control: string, error: string) {
    return this.registerForm.controls[control].dirty && 
    this.registerForm.controls[control].hasError(error);
  }

  

}