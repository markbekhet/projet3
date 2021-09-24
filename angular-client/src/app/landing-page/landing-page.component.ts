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

  submit(username: string) {
    if (username) {
      console.log(username);
      this.username = username;
    }
  }
}
