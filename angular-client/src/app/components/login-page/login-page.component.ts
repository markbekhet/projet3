import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  username: string = '';
  readonly DEFAULT_USERNAME: string = '';
  password: string = '';
  readonly DEFAULT_PASSWORD: string = '';

  //https://stackoverflow.com/questions/742451/what-is-the-simplest-regular-expression-to-validate-emails-to-not-accept-them-bl
  readonly EMAIL_REGEX: RegExp = new RegExp('^[^@\s]+@[^@\s]+\.[^@\s]+$'); 

  inputForm: FormGroup;
  usernameExists: boolean = false;

  //Validators.minLength(1), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9_-]*$')
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private request: RequestService
  ) {
    this.inputForm = this.formBuilder.group({
      username: formBuilder.control(this.DEFAULT_USERNAME, [ Validators.required ]),
      password: formBuilder.control(this.DEFAULT_PASSWORD, [ Validators.required ])
    });
  }

  ngOnInit(): void {}

  // reference https://www.youtube.com/watch?v=R1JWdvD0dv8
  // reference https://www.youtube.com/watch?v=9YuoQrvQ7R8
  // adapted from https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit/
  public async onSubmit(form: FormGroup) {
    this.username = form.value['username'];
    this.password = form.value['password'];

    console.log(form.value);

    try {
      this.request.connectClient(this.username, this.password)
        .subscribe(
          () => {
            this.router.navigate(['/' + this.username]);
          },
          error => {
            console.log(error);
          }
        )
      
    } catch(e: any) {

    }


    /*
    if(this.checkIfEmail(form.value['username'])) {

    } else {

    }
    */

    /*
    this.username = this.inputForm.value['username'];

    try {
      this.request.connectClient(this.username)
      .subscribe(
        accepted => {
          this.usernameExists = false;
          this.router.navigate(['/' + this.username]); //this.username = username
        },
        forbidden => this.usernameExists = true
      );

      // this.usernameExists = false;
    } catch (e: any) { }
      finally {
        this.inputForm.reset();
      }
      */
  }

  private checkIfEmail(usernameInput: string): boolean {
    return this.EMAIL_REGEX.test(usernameInput);
  }
}
