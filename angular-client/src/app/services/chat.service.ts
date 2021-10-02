import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from "socket.io-client";

import { Message } from '../models/MessageMeta';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
  // PATH = 'localhost:3000';

  socket = io(this.PATH);

  public message$: BehaviorSubject<Message> = new BehaviorSubject<Message>({
    clientName: '',
    message: '',
    date: {
      hour: '',
      minutes: '',
      seconds: ''
    }
  });

  public sendMessage(message: Message) {
    console.log('chat service sent: ' + message.message);
    this.socket.emit('msgToServer', JSON.stringify(message));
  }

  public getNewMessage = () => {
    this.socket.on('msgToClient', (message: Message) => {
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
