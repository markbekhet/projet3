import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ServerMessage, ClientMessage } from '@models/MessageMeta';
//import { AuthService } from '@services/authentication/auth.service';
import { SocketService } from '@services/socket/socket.service';

@Component({
  selector: 'app-communication-page',
  templateUrl: './communication-page.component.html',
  styleUrls: ['./communication-page.component.scss'],
})
export class CommunicationPageComponent implements OnInit, OnDestroy {
  username: string = '';
  messages: ClientMessage[] = [];
  messageForm: FormGroup;

  constructor(
    private activeRoute: ActivatedRoute,
    //private auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private socketService: SocketService
  ) {
    this.messageForm = this.formBuilder.group({
      message: formBuilder.control('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.username = this.activeRoute.snapshot.params.username;
    this.messages = [];
    // this.chat.connect();

    this.socketService.getNewMessage().subscribe((message: ClientMessage) => {
      if (message.from) {
        this.messages.unshift(message);
      }
      console.log(this.messages);
      console.log(`client received: ${message.message}`);
    });
  }

  onSubmit() {
    const MESSAGE = this.messageForm.controls.message.value;
    const messageToSend: ServerMessage = {
      from: this.socketService.profile$.value.pseudo,
      message: MESSAGE,
      roomName: 'general'
    }

    this.socketService.sendMessage(messageToSend);
    console.log(`client sent: ${messageToSend}`);

    this.messageForm.reset();
  }

  public self(clientName: string): boolean {
    return this.username === clientName;
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.messages = [];
    //this.socketService.disconnect();
    this.disconnect();
  }

  disconnect(): void {
    this.router.navigate(['/home']);
  }
}
