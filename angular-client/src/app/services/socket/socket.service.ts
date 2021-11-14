/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { BehaviorSubject /* , Observable */ } from 'rxjs';
import { io } from 'socket.io-client';

import { Message } from '@models/MessageMeta';
import { Status, UpdateUserInformation, User, UserProfileRequest } from '@src/app/models/UserMeta';
// import { AuthService } from '../authentication/auth.service';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket = io(PATH);
  drawingID: string = '';

  connect(): void {
    this.socket = io(PATH);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  getSocketID(): string {
    return this.socket.id;
  }

  message$: BehaviorSubject<Message> = new BehaviorSubject<Message>({
    clientName: '',
    message: '',
    date: {
      hour: '',
      minutes: '',
      seconds: '',
    },
  });

  profile$: BehaviorSubject<User> = new BehaviorSubject<User>({
    token: '',
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

    connectionHistory: {
      id: 0,
      date: '',
    },
    disconnectionHistory: {
      id: 0,
      date: '',
    },
    drawingEditionHistories: [],
  });

  setDrawingID = (value: string) => {
    this.drawingID = value;
  };

  // drawingElement: Subject<DrawingContent> = new Subject<DrawingContent>();
  // $drawingElements: Observable<DrawingContent> =
  // this.drawingElement.asObservable();

  // selectedTool: Subject<string> = new Subject<string>();
  // $selectedTool: Observable<string> = this.selectedTool.asObservable();

  // drawing: Subject<DrawingContent> = new Subject<DrawingContent>();
  // $drawing: Observable<DrawingContent> = this.drawing.asObservable();

  // ref: Subject<ElementRef> = new Subject<ElementRef>();
  // $refObs: Observable<ElementRef> = this.ref.asObservable();

  public sendMessage(message: Message) {
    console.log(`chat service sent: ${message.message}`);
    this.socket.emit('msgToServer', JSON.stringify(message));
  }

  public getNewMessage = () => {
    this.socket.on('msgToClient', (message: Message) => {
      console.log(`chat service received: ${message.message}`);
      this.message$.next(message);
    });

    return this.message$.asObservable();
  };

  public getUserProfile(profileRequest: UserProfileRequest) {
    this.socket.emit('getUserProfileRequest', JSON.stringify(profileRequest));
  }

  public receiveUserProfile = () => {
    this.socket.on('profileToClient', (profile: any) => {
      const user: User = JSON.parse(profile);
      this.profile$.next(user);
    });

    return this.profile$.asObservable();
  };

  public updateUserProfile(updates: UpdateUserInformation) {
    if (updates.newPseudo) {
      this.profile$.value.pseudo = updates.newPseudo;
    }
    if (updates.newPassword) {
      this.profile$.value.password = updates.newPassword;
    }
    this.profile$.next(this.profile$.value);
  }
}
