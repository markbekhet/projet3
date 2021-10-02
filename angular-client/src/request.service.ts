import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatService } from './app/chat.service';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token',
  })
}
@Injectable({
  providedIn: 'root'
})
export class RequestService {
  constructor(private httpClient: HttpClient, private chat: ChatService) { }

  // PATH = 'http://localhost:3000/';
  PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
  CONNECTION_PATH = 'connection/connect/';
  DISCONNECTION_PATH = 'connection/disconnect/';

  connectClient(username: string):Observable<string> {
    return this.httpClient.post<string>(this.PATH + this.CONNECTION_PATH + username, username);
  }

  disconnectClient(username: string):Observable<string> {
    //http://localhost:3000/connection/connect/
    //passer socket id et username
    /*{
      socket_id: this.chat.getSocketID(),
      username: username,
    }*/

    return this.httpClient.post<string>(this.PATH + this.DISCONNECTION_PATH + username, username);
  }
}
