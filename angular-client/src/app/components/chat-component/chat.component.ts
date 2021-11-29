/* eslint-disable no-console */
import {
  Component,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ChatHistory, ClientMessage, ServerMessage } from '@models/MessageMeta';
import { Status, User } from '@models/UserMeta';

import { AuthService } from '@services/authentication/auth.service';
import { ChatRoomService } from '@services/chat-room/chat-room.service';
// import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input()
  chatroomName!: string;

  messages: ChatHistory[] = [];
  messageForm!: FormGroup;

  isExpanded: boolean = false;

  readonly MESSAGE_REGEX: RegExp = new RegExp(/.*\S.*/);

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
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private socketService: SocketService,
    private chatRoomService: ChatRoomService // private interactionService: InteractionService
  ) {
    this.socketService.getUserProfile({
      userId: this.auth.getUserToken(),
      visitedId: this.auth.getUserToken(),
    });

    this.messageForm = this.formBuilder.group({
      message: formBuilder.control('', [
        Validators.required,
        Validators.pattern(this.MESSAGE_REGEX),
      ]),
    });
  }

  ngOnInit(): void {
    this.messages = this.chatRoomService.getChatHistoryList(this.chatroomName)!;

    this.socketService.socket!.on('msgToClient', (data: any) => {
      const message: ClientMessage = JSON.parse(data);
      if (message.from) {
        const newChatHistory: ChatHistory = {
          from: message.from,
          date: message.date,
          message: message.message,
        };
        const index = this.messages.indexOf(newChatHistory);
        if (index === -1)
          if(this.chatroomName === message.roomName){
            this.messages.unshift(newChatHistory);
          }
      }
      console.log(this.messages);
      console.log(`client received: ${message.message}`);
    });

    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });
  }

  toggleExpansion() {
    this.isExpanded = !this.isExpanded;

    // this.interactionService.$chatRoomName.subscribe((name: string) => {
    //   this.roomName = name;
    // });
  }

  onSubmit() {
    const MESSAGE = this.messageForm.controls.message.value;
    const messageToSend: ServerMessage = {
      from: this.user.pseudo!,
      message: MESSAGE,
      roomName: this.chatroomName,
    };

    this.socketService.sendMessage(messageToSend);
    console.log(messageToSend);

    this.messageForm.reset();
  }

  public self(clientName: string): boolean {
    return this.user.pseudo === clientName;
  }

  // might remove if not needed
  @HostListener('window:beforeunload')
  ngOnDestroy() {
    // this.chatRoomService.chatRooms.set("General", this.messages);
    console.log('destroyed');
    this.messages = [];
    // this.socketService.disconnect();
    // this.disconnect();
  }

  // disconnect(): void {
  //   this.router.navigate(['/home']);
  // }
}
