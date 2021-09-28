import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { RequestService } from 'src/request.service';

@Component({
  selector: 'app-communication-page',
  templateUrl: './communication-page.component.html',
  styleUrls: ['./communication-page.component.scss']
})
export class CommunicationPageComponent implements OnInit {

  username: string = '';

  constructor(private router: Router, private activeRoute: ActivatedRoute, private request: RequestService) {
    
  }

  ngOnInit(): void {
    this.username = this.activeRoute.snapshot.params['username'];
  }

  disconnect(): void {
    console.log('disconnect');
    //disconnect user
    try {
      this.request.disconnectClient(this.username)
      .subscribe(
        code => this.router.navigate(['/']), //this.username = username
        err => console.log(err)); //LandingPageComponent.usernameExists = true
    } catch (e: any) { 

    } 
    
  }

}
