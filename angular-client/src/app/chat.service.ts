import { Injectable } from '@angular/core';
import { ClientMessage, ServerMessage } from './MessageMeta';

import { BehaviorSubject, Observable } from 'rxjs';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public message$: BehaviorSubject<ServerMessage> = new BehaviorSubject<ServerMessage>({
    clientName: '',
    message: '',
    date: {
      hour: '',
      minutes: '',
      seconds: ''
    }
  });
  socket = io('http://localhost:3000');

  public sendMessage(message: ClientMessage) {
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

  constructor() { }
}
