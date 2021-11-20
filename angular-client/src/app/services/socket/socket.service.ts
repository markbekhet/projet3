/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { BehaviorSubject /* , Observable */, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { Message } from '@models/MessageMeta';
import { DrawingInformations } from '@models/drawing-informations';
import { DrawingContent, JoinDrawing, LeaveDrawing } from '@models/DrawingMeta';
import { ActiveDrawing, UserToken } from '../static-services/user_token';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket!: Socket;

  drawingID: string = '';
  drawingInformations$ = new Subject<DrawingInformations>();
  contentId$ = new Subject<{ contentId: number }>();
  drawingContent$ = new Subject<DrawingContent>();

  message$ = new BehaviorSubject<Message>({
    clientName: '',
    message: '',
    date: {
      hour: '',
      minutes: '',
      seconds: '',
    },
  });

  connect(): void {
    this.socket = io(PATH);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  getSocketID(): string {
    return this.socket.id;
  }

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

  public sendJoinDrawingRequest(joinInformation: JoinDrawing) {
    const joinInformationString = JSON.stringify(joinInformation);
    console.log(joinInformationString);
    this.socket.emit('joinDrawing', JSON.stringify(joinInformation));
  }

  public getDrawingInformations = () => {
    this.socket.on('drawingInformations', (data: string) => {
      const dataMod: DrawingInformations = JSON.parse(data);
      this.drawingInformations$.next(dataMod);
    });
    return this.drawingInformations$.asObservable();
  };

  public createDrawingContentRequest(data: { drawingId: number }) {
    this.socket.emit('createDrawingContent', JSON.stringify(data));
  }

  public getDrawingContentId = () => {
    this.socket.on('drawingContentCreated', (data: any) => {
      const dataMod: { contentId: number } = JSON.parse(data);
      if (dataMod !== undefined) {
        this.contentId$.next(dataMod);
      }
    });
    return this.contentId$.asObservable();
  };

  public sendDrawingToServer(data: DrawingContent) {
    console.log(data);
    this.socket.emit('drawingToServer', JSON.stringify(data));
  }

  public getDrawingContent = () => {
    this.socket.on('drawingToClient', (data: any) => {
      const dataMod: DrawingContent = JSON.parse(data);
      if (dataMod !== undefined) {
        this.drawingContent$.next(dataMod);
      }
    });
    return this.drawingContent$.asObservable();
  };

  public leaveDrawing() {
    const leaveDrawing: LeaveDrawing = {
      drawingId: ActiveDrawing.drawingId,
      userId: UserToken.userToken,
    };
    this.socket.emit('leaveDrawing', JSON.stringify(leaveDrawing));
  }
}
