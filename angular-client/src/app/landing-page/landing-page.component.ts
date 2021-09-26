import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  
  usernameForm: FormGroup;
  readonly DEFAULT_USERNAME: string = '';

  //Validators.minLength(1), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9_-]*$')
  constructor(private formBuilder: FormBuilder) {
    this.usernameForm = this.formBuilder.group({
      username: formBuilder.control(this.DEFAULT_USERNAME, [ Validators.required ])
    });
  }

  ngOnInit(): void {
  }

  // reference https://www.youtube.com/watch?v=9YuoQrvQ7R8
  // adapted from https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit/ 
  public onSubmit():void {
    if (this.usernameForm.valid) {
      console.log(this.usernameForm.value['username']);
      this.usernameForm.reset();
    } else {
      this.usernameForm.get(['username'])?.markAsTouched( {onlySelf: true});
    }
  }
}
