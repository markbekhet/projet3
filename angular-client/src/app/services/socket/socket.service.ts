/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { BehaviorSubject, /* , Observable */
Subject} from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { Message } from '@models/MessageMeta';
import { Status, UpdateUserInformation, User, UserProfileRequest } from '@src/app/models/UserMeta';
// import { AuthService } from '../authentication/auth.service';
import { JoinDrawing, LeaveDrawing } from '@src/app/models/joinDrrawing';
import { DrawingInformations } from '@src/app/models/drawing-informations';
import { DrawingContent } from '@src/app/models/DrawingMeta';
import { ActiveDrawing, UserToken } from '../static-services/user_token';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket!: Socket;
  drawingID: string = '';
  drawingInformations$: Subject<DrawingInformations> = new Subject<DrawingInformations>();
  contentId$: Subject<{contentId: number}> = new Subject<{contentId: number}>();
  drawingContent$: Subject<DrawingContent> = new Subject<DrawingContent>();
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

    connectionHistories: [],
    disconnectionHistories: [],
    drawingEditionHistories: [],
  });

  setDrawingID = (value: string) => {
    this.drawingID = value;
  };

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
      console.log(user);
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

  public sendJoinDrawingRequest(joinInformation: JoinDrawing){
    let joinInformationString = JSON.stringify(joinInformation);
    console.log(joinInformationString);
    this.socket.emit("joinDrawing", JSON.stringify(joinInformation));
  }

  public getDrawingInformations= ()=>{
    this.socket.on('drawingInformations', (data: string) =>{
      let dataMod: DrawingInformations = JSON.parse(data);
      this.drawingInformations$.next(dataMod);
    });
    return this.drawingInformations$.asObservable();
  }

  public createDrawingContentRequest(data:{drawingId: number}){
    this.socket.emit("createDrawingContent", JSON.stringify(data));
  }

  public getDrawingContentId = ()=>{
    this.socket.on("drawingContentCreated", (data:any)=>{
        let dataMod: {contentId: number} = JSON.parse(data);
        if(dataMod !== undefined){
          this.contentId$.next(dataMod);
      }
    })
    return this.contentId$.asObservable();
  }

  public sendDrawingToServer(data: DrawingContent){
    console.log(data);
    this.socket.emit("drawingToServer", JSON.stringify(data));
  }

  public getDrawingContent= ()=>{
    this.socket.on("drawingToClient", (data:any)=>{
      let dataMod: DrawingContent = JSON.parse(data);
      if(dataMod !== undefined){
        this.drawingContent$.next(dataMod);
      }
    })
    return this.drawingContent$.asObservable();
  }

  public leaveDrawing(){
    let leaveDrawing: LeaveDrawing = {drawingId: ActiveDrawing.drawingId, userId: UserToken.userToken};
    this.socket.emit("leaveDrawing", JSON.stringify(leaveDrawing));
  }
}
