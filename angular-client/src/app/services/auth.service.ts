import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { UserRegistrationInfo, UserCredentials } from '../../../../common/user';  
import { User } from '../models/UserMeta';

//const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000/';
//const CONNECTION_PATH = 'connection/connect/';
//const DISCONNECTION_PATH = 'connection/disconnect/';
const REGISTER_PATH = 'register/';
const LOGIN_PATH = 'login/';
const DISCONNECT_PATH = 'user/disconnect/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authentifiedUser: BehaviorSubject<User> = new BehaviorSubject<User>({
    token: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });

  constructor(private httpClient: HttpClient) {}

  login(user: UserCredentials): Observable<string> {
    return this.httpClient.post(PATH + LOGIN_PATH, user, { responseType: 'text' }).
    pipe(tap(responseData => {
      this.httpClient.get(PATH + '')
      //this.authenticateUser(user, responseData);
    }));
  }

  register(user: UserRegistrationInfo): Observable<string> {
    return this.httpClient.post(PATH + REGISTER_PATH, user, { responseType: 'text' })
    .pipe(tap(responseData => {
      this.authenticateUser(user, responseData);
    }));
  }

  disconnect(): Observable<string> {
    return this.httpClient.post(PATH + DISCONNECT_PATH + this.authentifiedUser.value.token, '', { responseType: 'text' });
  }

  //deprecated
  connectClient(username: string, password: string): Observable<string> {
    return this.httpClient.post<string>(PATH + '' + username, username);
  }

  //deprecated
  disconnectClient(username: string): Observable<string> {
    return this.httpClient.post<string>(PATH + '' + username, username);
  }

  private authenticateUser(user: UserRegistrationInfo, token: string) {
    const registeredUser: User = {
      token: token,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.pseudo,
      email: user.emailAddress,
      password: user.password
    }
    
    this.authentifiedUser.next(registeredUser);
  }
  

  //passer socket id et username
  /*{
    socket_id: this.chat.getSocketID(),
    username: username,
  }*/
}
