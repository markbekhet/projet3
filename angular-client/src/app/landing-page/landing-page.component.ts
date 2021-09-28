import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService } from 'src/request.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  
  username: string = '';
  usernameForm: FormGroup;
  static usernameExists: boolean = false;

  //Validators.minLength(1), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9_-]*$')
  constructor(private formBuilder: FormBuilder, private router: Router, private request: RequestService) {
    this.usernameForm = this.formBuilder.group({
      username: formBuilder.control('', [ Validators.required])
    });
  }

  ngOnInit(): void {
  }

  // reference https://www.youtube.com/watch?v=R1JWdvD0dv8
  // reference https://www.youtube.com/watch?v=9YuoQrvQ7R8
  // adapted from https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit/
  public async onSubmit() {
    let username = this.usernameForm.value['username'];
    
    try {
      this.request.connectClient(username)
      .subscribe(
        code => this.router.navigate(['/' + username]), //this.username = username
        err => LandingPageComponent.usernameExists = true); //LandingPageComponent.usernameExists = true
    
      LandingPageComponent.usernameExists = false;
    } catch (e: any) { } 
      finally {
        this.usernameForm.reset();
      } 
    }

  get staticUsernameExists() {
    return LandingPageComponent.usernameExists;
  }
}
