import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from 'src/app/services/request.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  username: string = '';
  usernameForm: FormGroup;
  usernameExists: boolean = false;

  //Validators.minLength(1), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9_-]*$')
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private request: RequestService
  ) {
    this.usernameForm = this.formBuilder.group({
      username: formBuilder.control('', [ Validators.required])
    });
  }

  ngOnInit(): void {}

  // reference https://www.youtube.com/watch?v=R1JWdvD0dv8
  // reference https://www.youtube.com/watch?v=9YuoQrvQ7R8
  // adapted from https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit/
  public async onSubmit() {
    this.username = this.usernameForm.value['username'];

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
        this.usernameForm.reset();
      }
  }
}
