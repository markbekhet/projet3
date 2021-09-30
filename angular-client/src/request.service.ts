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
  constructor(private httpClient: HttpClient, private chat: ChatService) {

  }

  connectClient(username: string):Observable<string> {
    //http://localhost:3000/connection/connect/
    //http://azureuser@projet3-101.eastus.cloudapp.azure.com:3000/connection/connect/
    //let username_encoded = encodeURI(username);
    //console.log(username_encoded);
    return this.httpClient.post<string>('http://localhost:3000/connection/connect/' + username, username);
  }

  disconnectClient(username: string):Observable<string> {
    //http://localhost:3000/connection/connect/
    //passer socket id et username
    /*{
      socket_id: this.chat.getSocketID(),
      username: username,
    }*/
    
    return this.httpClient.post<string>('http://localhost:3000/connection/disconnect/' + username, username);
  }
}
