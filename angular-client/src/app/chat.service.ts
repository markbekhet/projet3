import { Injectable } from '@angular/core';
import { ClientMessage, ServerMessage } from './MessageMeta';

import { BehaviorSubject, Observable } from 'rxjs';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
  PATH = 'localhost:3000';

  public message$: BehaviorSubject<ServerMessage> = new BehaviorSubject<ServerMessage>({
    clientName: '',
    message: '',
    date: {
      hour: '',
      minutes: '',
      seconds: ''
    }
  });
  socket = io(this.PATH);

  public sendMessage(message: ServerMessage) {
    console.log('chat service sent: ' + message.message);
    this.socket.emit('msgToServer', JSON.stringify(message));
  }

  public getNewMessage = () => {
    this.socket.on('msgToClient', (message: ServerMessage) => {
      console.log('chat service received: ' + message.message);
      this.message$.next(message);
    });

    return this.message$.asObservable();
  };

  public connect(): void {
    this.socket = io(this.PATH);
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  public getSocketID(): string {
    return this.socket.id;
  }

  constructor() { }
}
