import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RequestService } from 'src/request.service';
import { ClientMessage, ServerMessage } from '../MessageMeta';
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
    this.chat.connect();

    this.messages = [];

    this.chat.getNewMessage().subscribe((message: ServerMessage) => {
      if (message.clientName) {
        this.messages.unshift(message);
      }
      console.log(this.messages);
      console.log('client received: ' + message.message);
    })
  }

  ngOnDestroy() {
    this.disconnect();
    alert('1');
    this.chat.disconnect();
    alert('2');
  }

  disconnect(): void {
    //disconnect user
    try {
      this.request.disconnectClient(this.username)
      .subscribe(
        code => {
          this.router.navigate(['/']);
        }, //this.username = username
        err => console.log(err)); //LandingPageComponent.usernameExists = true
    } catch (e: any) { 

    }
    this.messages = []; 
    
  }

  onSubmit() {
    let message: ClientMessage = {
      clientName: this.username,
      message: this.messageForm.value['message']
    };
    this.chat.sendMessage(message);
    console.log('client sent: ' + message);
    
    this.messageForm.reset();
  }

  public self(clientName: string):boolean {
    return this.username === clientName; 
  }

}
