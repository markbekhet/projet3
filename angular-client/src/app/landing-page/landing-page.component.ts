import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { RequestService } from 'src/request.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  
  username: string = '';
  usernameForm: FormGroup;
  usernameList: string[] = [];

  //usernameListStub: string[] = [ 'abc123', 'paul', 'batikan-iscan' ];

  //Validators.minLength(1), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9_-]*$')
  constructor(private formBuilder: FormBuilder, private request: RequestService) {
    this.usernameList = [ 'abc123', 'paul', 'batikan-iscan' ];
        
    this.usernameForm = this.formBuilder.group({
      username: formBuilder.control('', [ Validators.required, this.usernameNotLoggedIn ])
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
      await this.request.connectClient(username);
      debugger;
      console.log('try');
    } catch (e: any) {
      console.log('erreur: ' + e);
    }
    
    console.log(username);
    this.usernameForm.reset();
    
    this.username = username; 
  }

  private usernameNotLoggedIn(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }

    if ([ 'abc123', 'paul', 'batikan-iscan' ].indexOf(control.value) >= 0) {
      return { 'usernameAlreadyExists' : true };
    }

    return null;
  }
}
