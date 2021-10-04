import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
// const PATH = 'http://localhost:3000/';
const CONNECTION_PATH = 'connection/connect/';
const DISCONNECTION_PATH = 'connection/disconnect/';

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
  constructor(private httpClient: HttpClient) {}

  connectClient(username: string):Observable<string> {
    return this.httpClient.post<string>(PATH + CONNECTION_PATH + username, username);
  }

  disconnectClient(username: string):Observable<string> {
    return this.httpClient.post<string>(PATH + DISCONNECTION_PATH + username, username);
  }

  //passer socket id et username
  /*{
    socket_id: this.chat.getSocketID(),
    username: username,
  }*/
}
