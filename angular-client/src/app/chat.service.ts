import { Injectable } from '@angular/core';
//import { ClientMessage } from './MessageMeta';

import { BehaviorSubject, Observable } from 'rxjs';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  socket = io('http://localhost:3000');

  public sendMessage(message: string) {
    this.socket.emit('message', message);
  }

  public getNewMessage = () => {
    this.socket.on('message', (message) =>{
      this.message$.next(message);
    });
    
    return this.message$.asObservable();
  };

  constructor() { }
}
