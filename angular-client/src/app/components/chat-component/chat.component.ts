/* eslint-disable no-console */
import {
  Component,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ChatHistory,ServerMessage } from '@models/MessageMeta';
import { Status, User } from '@models/UserMeta';

import { AuthService } from '@services/authentication/auth.service';
import { ChatRoomService } from '@services/chat-room/chat-room.service';
// import { InteractionService } from '@services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';
import { AvatarService } from '@src/app/services/avatar/avatar.service';
import { InteractionService } from '@src/app/services/interaction/interaction.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input()
  chatroomName!: string;

  messages: {date: string, message: string, userInfo: User}[] = [];
  messageForm!: FormGroup;

  @Input()
  isExpanded: boolean = true;

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
    private chatRoomService: ChatRoomService,
    private interactionService: InteractionService,
    private avatarService: AvatarService
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

  initMessageList(){
    this.messages = [];
    let channelMessageHistories = this.chatRoomService.getChatHistoryList(this.chatroomName)!;
    channelMessageHistories.forEach((chatHistory: ChatHistory)=>{
      this.messages.unshift(this.createShownMessage(chatHistory));
    })
  }

  createShownMessage(chatHistory: ChatHistory):{date: string, message: string, userInfo: User}{
    let user = this.socketService.users$.value.get(chatHistory.from!)!;
    let newShownMessage:{date: string, message: string, userInfo: User} = 
          {date: chatHistory.date!, message: chatHistory.message!, userInfo: user};
    return newShownMessage;
  }

  ngOnInit(): void {
    //this.messages = this.chatRoomService.getChatHistoryList(this.chatroomName)!;
    this.initMessageList()

    this.interactionService.$updateChatHistorySignal.subscribe((sig)=>{
      if(sig)
        this.initMessageList();
    })

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
      from: this.auth.getUserToken(),
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
  decodeAvatar(avatarEncoded: string) {
    if (avatarEncoded === undefined) {
      return '';
    }
    return this.avatarService.decodeAvatar(avatarEncoded);
  }
}
