import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {

  registerForm: FormGroup;

  readonly EMAIL_REGEX: RegExp = new RegExp('^[^@\s]+@[^@\s]+\.[^@\s]+$');

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private request: RequestService) {
      this.registerForm = this.formBuilder.group({
        firstName: formBuilder.control('', [ Validators.required ]),
        lastName: formBuilder.control('', [ Validators.required ]),
        username: formBuilder.control('', [ Validators.required ]),
        email: formBuilder.control('', [ Validators.required, Validators.pattern(this.EMAIL_REGEX) ]),
        password: formBuilder.control('', [ Validators.required ]),
        avatar: formBuilder.control('', [ Validators.required ])
      });
    }

  ngOnInit(): void {
  }

  public async onSubmit(form: FormGroup) {
    console.log(form.value);
  }

  public checkError(control: string, error: string) {
    return this.registerForm.controls[control].dirty && 
    this.registerForm.controls[control].hasError(error);
  }

  

}