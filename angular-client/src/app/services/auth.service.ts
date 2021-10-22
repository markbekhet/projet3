import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';

import { UserRegistrationInfo, UserCredentials } from '../../../../common/user';  
import { User } from '../models/UserMeta';

//const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000/';
//const CONNECTION_PATH = 'connection/connect/';
//const DISCONNECTION_PATH = 'connection/disconnect/';
const REGISTER_PATH = 'register/';
const LOGIN_PATH = 'login/';
const DISCONNECT_PATH = 'user/disconnect/';
const GET_PROFILE_PATH = 'user/profile/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // login error codes
  readonly USER_LOGGED_IN = 'User is already logged in';
  readonly NO_USER_FOUND = 'There is no account with this username or email';
  readonly INCORRECT_PASSWORD = 'Incorrect password';

  // register error codes
  readonly DUPLICATE_EMAIL = 'duplicate key value violates unique constraint "UQ_c7a8d184ab23d7ebdc29453832a"';
  readonly DUPLICATE_USERNAME = 'duplicate key value violates unique constraint "UQ_31b55a63ebb518f30d7e20dc922"';

  readonly NULL_USER: User = {
    token: '',
  }
  authentifiedUser: BehaviorSubject<User> = new BehaviorSubject<User>(this.NULL_USER);

  constructor(private httpClient: HttpClient) {}

  login(user: UserCredentials) {
    /*
    return this.httpClient.post(PATH + LOGIN_PATH, user, { responseType: 'text' })
    .pipe(tap(token => {
      registeredUser.token = token;
    }), concatMap(responseData => this.httpClient.get<User>(PATH + GET_PROFILE_PATH + responseData)
    .pipe(tap(responseData => {
      console.log('profile returns: ' + responseData.toString());

      registeredUser.firstName = 'first name test';
      registeredUser.lastName = 'last name test';
      registeredUser.email = 'prog.test@gmail.com';
    }))), 
    tap(() => {
      
      console.log(registeredUser);
      this.authenticateUser(registeredUser);
    }));
    */
   return this.httpClient.post(PATH + LOGIN_PATH, user, { responseType: 'text' })
   .pipe(tap(token => {
    const loggedInUser: User = {
      token: token,
    }
    this.authenticateUser(loggedInUser);
   }));
  }

  register(user: UserRegistrationInfo): Observable<string> {
    return this.httpClient.post(PATH + REGISTER_PATH, user, { responseType: 'text' })
    .pipe(tap(token => {
      const registeredUser: User = {
        token: token,
      }
      this.authenticateUser(registeredUser);
    }));
  }

  //this.authentifiedUser.next(this.NULL_USER);
  disconnect(): Observable<string> {
    return this.httpClient.post(PATH + DISCONNECT_PATH + this.authentifiedUser.value.token, null, { responseType: 'text' });
  }

  getProfile() {
    return this.httpClient.get<User>(PATH + GET_PROFILE_PATH + this.authentifiedUser.value.token);
  }
  
  private authenticateUser(user: User) {
    if (user.token)
      this.authentifiedUser.next(user);
  }
  

  //passer socket id et username
  /*{
    socket_id: this.chat.getSocketID(),
    username: username,
  }*/
}
