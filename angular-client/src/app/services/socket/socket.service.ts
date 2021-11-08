/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { BehaviorSubject, /* , Observable */ 
Subject} from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { Message } from '@models/MessageMeta';
import { JoinDrawing } from '@src/app/models/joinDrrawing';
import { DrawingInformations } from '@src/app/models/drawing-informations';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket!: Socket;
  drawingID: string = '';
  drawingInformations$: Subject<DrawingInformations> = new Subject<DrawingInformations>();
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
}
