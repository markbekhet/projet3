import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-communication-page',
  templateUrl: './communication-page.component.html',
  styleUrls: ['./communication-page.component.scss']
})
export class CommunicationPageComponent implements OnInit {

  username: string = '';

  constructor(private activeRoute: ActivatedRoute) {
    
  }

  ngOnInit(): void {
    this.username = this.activeRoute.snapshot.params['username'];
  }

}
