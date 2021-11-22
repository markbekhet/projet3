import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ServerMessage, ClientMessage } from '@models/MessageMeta';
import { AuthService } from '@services/authentication/auth.service';
import { SocketService } from '@services/socket/socket.service';
import { Status } from '@common/user';
import { User } from '@src/app/models/UserMeta';

@Component({
  selector: 'app-communication-page',
  templateUrl: './communication-page.component.html',
  styleUrls: ['./communication-page.component.scss'],
})
export class CommunicationPageComponent implements OnInit, OnDestroy {
  username: string = '';
  messages: ClientMessage[] = [];
  messageForm: FormGroup;
  user: User = {
    id: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    status: Status.OFFLINE,
    pseudo: '',

    averageCollaborationTime: 0,
    totalCollaborationTime: 0,
    numberCollaborationTeams: 0,
    numberCollaboratedDrawings: 0,
    numberAuthoredDrawings: 0,

    connectionHistories: [],
    disconnectionHistories: [],
    drawingEditionHistories: [],
  };

  constructor(
    private activeRoute: ActivatedRoute,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private socketService: SocketService
  ) {
    this.socketService.getUserProfile({
      userId: this.auth.token$.value,
      visitedId: this.auth.token$.value,
    });

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

    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });
  }

  onSubmit() {
    const MESSAGE = this.messageForm.controls.message.value;
    const messageToSend: ServerMessage = {
      from: this.user.pseudo!,
      message: MESSAGE,
      roomName: 'General',
    };

    this.socketService.sendMessage(messageToSend);
    console.log(messageToSend);

    this.messageForm.reset();
  }

  public self(clientName: string): boolean {
    return this.user.pseudo === clientName;
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.messages = [];
    // this.socketService.disconnect();
    this.disconnect();
  }

  disconnect(): void {
    this.router.navigate(['/home']);
  }
}
