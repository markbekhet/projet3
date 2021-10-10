import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserRegistrationInfo, UserCredentials } from '../../../../common/user';  

//const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000/';
//const CONNECTION_PATH = 'connection/connect/';
//const DISCONNECTION_PATH = 'connection/disconnect/';
const REGISTER_PATH = 'register/';
const LOGIN_PATH = 'login/';
const DISCONNECT_PATH = 'disconnect/';

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

  login(user: UserCredentials): Observable<string> {
    return this.httpClient.post(PATH + LOGIN_PATH, user, { responseType: 'text' });
  }

  register(user: UserRegistrationInfo): Observable<string> {
    return this.httpClient.post(PATH + REGISTER_PATH, user, { responseType: 'text' });
  }

  disconnect(token: string): Observable<string> {
    return this.httpClient.post(PATH + DISCONNECT_PATH, token, { responseType: 'text' });
  }

  //deprecated
  connectClient(username: string, password: string): Observable<string> {
    return this.httpClient.post<string>(PATH + '' + username, username);
  }

  disconnectClient(username: string): Observable<string> {
    return this.httpClient.post<string>(PATH + '' + username, username);
  }
  

  //passer socket id et username
  /*{
    socket_id: this.chat.getSocketID(),
    username: username,
  }*/
}
