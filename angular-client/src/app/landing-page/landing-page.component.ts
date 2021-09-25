import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  
  username: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  submit(username: string): void {
    if(this.verifyUsername(username)) {
      console.log(username);
      this.username = username;
      //TODO: add server request to login to server
      //TODO: reset form
    }
  }

  verifyUsername(username: string): boolean {
    const usernameEmpty: boolean = username.length <= 0;
    const usernameExistsOnServer: boolean = false; //TODO: add server request via service
    
    if (usernameEmpty) {
      alert('ERREUR! Veuillez entrer un nom d\'utilisateur!');
    }
    
    return !usernameEmpty && !usernameExistsOnServer;
  }
}
