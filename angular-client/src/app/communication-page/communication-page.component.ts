import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RequestService } from 'src/request.service';
import { ServerMessage } from '../MessageMeta';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-communication-page',
  templateUrl: './communication-page.component.html',
  styleUrls: ['./communication-page.component.scss']
})
export class CommunicationPageComponent implements OnInit {

  username: string = '';
  messages: ServerMessage[] = [];

  messageForm: FormGroup;

  constructor(private router: Router, private activeRoute: ActivatedRoute, 
    private request: RequestService, private formBuilder: FormBuilder, 
    private chat: ChatService) {
    this.messageForm = this.formBuilder.group({
      message: formBuilder.control('', [ Validators.required])
    });
  }

  ngOnInit(): void {
    this.username = this.activeRoute.snapshot.params['username'];
    
    this.chat.getNewMessage().subscribe((message: string) => {
      this.messages.push({
        clientName: this.username,
        message: message,
        date: {
          hour: '',
          minutes: '',
          seconds: ''
        }
      });
    })
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

  onSubmit() {
    let message = this.messageForm.value['message'];
    this.chat.sendMessage(message);

    this.messageForm.reset();
  }

}
