/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject} from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { Message } from '@models/MessageMeta';
import { Status, UpdateUserInformation, User, UserProfileRequest } from '@src/app/models/UserMeta';
import { JoinDrawing, LeaveDrawing } from '@src/app/models/joinDrrawing';
import { DrawingInformations } from '@src/app/models/drawing-informations';
import { DrawingContent } from '@src/app/models/DrawingMeta';
import { Team } from '@src/app/models/teamsMeta';
import { JoinTeam } from '@src/app/models/joinTeam';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: Socket| undefined;
  drawingID: string = '';
  drawingInformations$: Subject<DrawingInformations> = new Subject<DrawingInformations>();
  contentId$: Subject<{contentId: number}> = new Subject<{contentId: number}>();
  drawingContent$: Subject<DrawingContent> = new Subject<DrawingContent>();
  users$: BehaviorSubject<Map<string, User>> = new BehaviorSubject<Map<string, User>>(new Map());
  teams$: BehaviorSubject<Map<string, Team>> = new BehaviorSubject<Map<string, Team>>(new Map())
  connect(): void {
    this.socket = io(PATH);
  }

  disconnect(): void {
    this.socket!.disconnect();
    this.socket = undefined
  }

  getSocketID(): string {
    return this.socket!.id;
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
  });

  setDrawingID = (value: string) => {
    this.drawingID = value;
  };

  public sendMessage(message: Message) {
    console.log(`chat service sent: ${message.message}`);
    this.socket!.emit('msgToServer', JSON.stringify(message));
  }

  public getNewMessage = () => {
    this.socket!.on('msgToClient', (message: Message) => {
      console.log(`chat service received: ${message.message}`);
      this.message$.next(message);
    });

    return this.message$.asObservable();
  };

  public getUserProfile(profileRequest: UserProfileRequest) {
    this.socket!.emit('getUserProfileRequest', JSON.stringify(profileRequest));
  }

  public receiveUserProfile = () => {
    this.socket!.on('profileToClient', (profile: any) => {
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
    this.socket!.emit("joinDrawing", JSON.stringify(joinInformation));
  }

  public getDrawingInformations= ()=>{
    this.socket!.on('drawingInformations', (data: string) =>{
      let dataMod: DrawingInformations = JSON.parse(data);
      this.drawingInformations$.next(dataMod);
    });
    return this.drawingInformations$.asObservable();
  }

  public createDrawingContentRequest(data:{drawingId: number}){
    this.socket!.emit("createDrawingContent", JSON.stringify(data));
  }

  public getDrawingContentId = ()=>{
    this.socket!.on("drawingContentCreated", (data:any)=>{
        let dataMod: {contentId: number} = JSON.parse(data);
        if(dataMod !== undefined){
          this.contentId$.next(dataMod);
      }
    })
    return this.contentId$.asObservable();
  }

  public sendDrawingToServer(data: DrawingContent){
    console.log(data);
    this.socket!.emit("drawingToServer", JSON.stringify(data));
  }

  public getDrawingContent= ()=>{
    this.socket!.on("drawingToClient", (data:any)=>{
      let dataMod: DrawingContent = JSON.parse(data);
      if(dataMod !== undefined){
        this.drawingContent$.next(dataMod);
      }
    })
    return this.drawingContent$.asObservable();
  }

  public leaveDrawing(leaveDrawing: LeaveDrawing){
    this.socket!.emit("leaveDrawing", JSON.stringify(leaveDrawing));
  }

  public getAllUsers = ()=>{
    this.socket!.on("usersArrayToClient", (data: any)=>{
      let dataMod: {userList: User[]} = JSON.parse(data);
      let usersTemp: Map<string, User> = new Map();
      dataMod.userList.forEach((user)=>{
        if(!usersTemp.has(user.id!)){
          usersTemp.set(user.id!, user);
        }
      })
      this.users$.next(usersTemp);
    });
    return this.users$;
  }

  getAllTeams = ()=>{
    this.socket!.on("teamsArrayToClient", (data)=>{
      let dataMod: {teamList: Team[]} = JSON.parse(data);
      let teamsTemp: Map<string, Team> = new Map();
      dataMod.teamList.forEach((team)=>{
        if(!teamsTemp.has(team.id!)){
          teamsTemp.set(team.id!, team);
        }
      })
      this.teams$.next(teamsTemp);

    })
    return this.teams$;
  }

  sendRequestJoinTeam(joinTeam: JoinTeam){
    let joinTeamString = JSON.stringify(joinTeam);
    this.socket!.emit("joinTeam", joinTeamString)
  }
}
