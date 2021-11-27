import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ServerMessage, ClientMessage, ChatHistory } from '@models/MessageMeta';
import { AuthService } from '@services/authentication/auth.service';
import { SocketService } from '@services/socket/socket.service';
import { Status } from '@common/user';
import { User } from '@src/app/models/UserMeta';
import { ChatRoomService } from '@src/app/services/chat-room/chat-room.service';
import { InteractionService } from '@src/app/services/interaction/interaction.service';

@Component({
  selector: 'app-communication-page',
  templateUrl: './communication-page.component.html',
  styleUrls: ['./communication-page.component.scss'],
})
export class CommunicationPageComponent implements OnInit, OnDestroy {
  roomName: string = '';
  username: string = '';
  messages: ChatHistory[] = [];
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

  readonly MESSAGE_REGEX: RegExp = new RegExp(/.*\S.*/);


  constructor(
    private activeRoute: ActivatedRoute,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private socketService: SocketService,
    private chatRoomService: ChatRoomService,
    private interactionService: InteractionService
  ) {
    this.socketService.getUserProfile({
      userId: this.auth.token$.value,
      visitedId: this.auth.token$.value,
    });

    this.messageForm = this.formBuilder.group({
      message: formBuilder.control('', [Validators.required, Validators.pattern(this.MESSAGE_REGEX)]),
    });
  }

  ngOnInit(): void {
    this.messages = this.chatRoomService.getChatHistoryList(this.roomName)!
    this.username = this.activeRoute.snapshot.params.username;

    this.socketService.socket!.on("msgToClient", (data: any) => {
      let message: ClientMessage = JSON.parse(data);
      if (message.from) {
        let newChatHistory: ChatHistory = {from: message.from, date: message.date, message: message.message}
        let index = this.messages.indexOf(newChatHistory);
        if(index === -1)
          //this.chatRoomService.addChatHistory(message);
          this.messages.unshift(newChatHistory);
      }
      console.log(this.messages);
      console.log(`client received: ${message.message}`);

    });

    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });
    this.interactionService.$chatRoomName.subscribe((name: string)=>{
      this.roomName = name;
    })
  }

  onSubmit() {
    const MESSAGE = this.messageForm.controls.message.value;
    const messageToSend: ServerMessage = {
      from: this.user.pseudo!,
      message: MESSAGE,
      roomName: this.roomName
    }

    this.socketService.sendMessage(messageToSend);
    console.log(messageToSend);

    this.messageForm.reset();
  }

  public self(clientName: string): boolean {
    return this.user.pseudo === clientName;
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    //this.chatRoomService.chatRooms.set("General", this.messages);
    console.log("destroyed")
    this.messages = [];
    // this.socketService.disconnect();
    this.disconnect();
  }

  disconnect(): void {
    this.router.navigate(['/home']);
  }
}
