/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { BehaviorSubject /* , Observable */, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { ServerMessage, ClientMessage } from '@models/MessageMeta';
import { DrawingInformations } from '@models/drawing-informations';
import { DrawingContent, JoinDrawing, LeaveDrawing } from '@models/DrawingMeta';

import {
  Status,
  UpdateUserInformation,
  User,
  UserProfileRequest,
} from '@models/UserMeta';
import { Team } from '@src/app/models/teamsMeta';
import { JoinTeam, LeaveTeam } from '@src/app/models/joinTeam';
//import { ChatRoomService } from '../chat-room/chat-room.service';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: Socket | undefined;

  drawingID: string = '';
  drawingInformations$ = new Subject<DrawingInformations>();
  contentId$ = new Subject<{ contentId: number }>();
  drawingContent$ = new Subject<DrawingContent>();

  users$ = new BehaviorSubject<Map<string, User>>(new Map());
  teams$ = new BehaviorSubject<Map<string, Team>>(new Map());

  message$ = new BehaviorSubject<ClientMessage>({
    from: '',
    message: '',
    date: '',
    roomName: '',
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

  connect(): void {
    this.socket = io(PATH);
  }

  disconnect(): void {
    this.socket!.disconnect();
    this.socket = undefined;
  }

  getSocketID(): string {
    return this.socket!.id;
  }

  // chatHistories$: BehaviorSubject<Map<string, ChatHistory>> = new BehaviorSubject<Map<string, ChatHistory>>();

  setDrawingID = (value: string) => {
    this.drawingID = value;
  };

  public sendMessage(message: ServerMessage) {
    console.log(`chat service sent: ${message.message}`);
    this.socket!.emit('msgToServer', JSON.stringify(message));
  }

  public getNewMessage = () => {
    this.socket!.on('msgToClient', (messageString: any) => {
      const message: ClientMessage = JSON.parse(messageString);
      console.log(`chat service received: ${message.message}`);
      //this.chatRoomService.addChatHistory(message);
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

  public sendJoinDrawingRequest(joinInformation: JoinDrawing) {
    const joinInformationString = JSON.stringify(joinInformation);
    console.log(joinInformationString);
    this.socket!.emit('joinDrawing', JSON.stringify(joinInformation));
  }

  public getDrawingInformations = () => {
    this.socket!.on('drawingInformations', (data: string) => {
      const dataMod: DrawingInformations = JSON.parse(data);
      this.drawingInformations$.next(dataMod);
    });
    return this.drawingInformations$.asObservable();
  };

  public createDrawingContentRequest(data: { drawingId: number }) {
    this.socket!.emit('createDrawingContent', JSON.stringify(data));
  }

  public getDrawingContentId = () => {
    this.socket!.on('drawingContentCreated', (data: any) => {
      const dataMod: { contentId: number } = JSON.parse(data);
      if (dataMod !== undefined) {
        this.contentId$.next(dataMod);
      }
    });
    return this.contentId$.asObservable();
  };

  public sendDrawingToServer(data: DrawingContent) {
    console.log(data);
    this.socket!.emit('drawingToServer', JSON.stringify(data));
  }

  public getDrawingContent = () => {
    this.socket!.on('drawingToClient', (data: any) => {
      const dataMod: DrawingContent = JSON.parse(data);
      if (dataMod !== undefined) {
        this.drawingContent$.next(dataMod);
      }
    });
    return this.drawingContent$.asObservable();
  };

  public leaveDrawing(leaveDrawing: LeaveDrawing) {
    this.socket!.emit('leaveDrawing', JSON.stringify(leaveDrawing));
  }

  public getAllUsers = () => {
    this.socket!.on('usersArrayToClient', (data: any) => {
      const dataMod: { userList: User[] } = JSON.parse(data);
      const usersTemp: Map<string, User> = new Map();
      dataMod.userList.forEach((user) => {
        if (!usersTemp.has(user.id!)) {
          usersTemp.set(user.id!, user);
        }
      });
      this.users$.next(usersTemp);
    });
    return this.users$;
  };

  getAllTeams = () => {
    this.socket!.on('teamsArrayToClient', (data) => {
      const dataMod: { teamList: Team[] } = JSON.parse(data);
      const teamsTemp: Map<string, Team> = new Map();
      dataMod.teamList.forEach((team) => {
        if (!teamsTemp.has(team.id!)) {
          teamsTemp.set(team.id!, team);
        }
      });
      this.teams$.next(teamsTemp);
    });
    return this.teams$;
  };

  sendRequestJoinTeam(joinTeam: JoinTeam) {
    const joinTeamString = JSON.stringify(joinTeam);
    this.socket!.emit('joinTeam', joinTeamString);
  }

  leaveTeam(leaveTeam: LeaveTeam) {
    const leaveTeamString = JSON.stringify(leaveTeam);
    this.socket!.emit('leaveTeam', leaveTeamString);
  }

  getTeamGallery(data: {teamName: string}){
    this.socket!.emit("getTeamGallery", JSON.stringify(data));
  }
}
