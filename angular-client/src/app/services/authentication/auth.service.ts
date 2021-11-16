import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { /* concatMap, */ tap } from 'rxjs/operators';

import { UserRegistrationInfo, UserCredentials } from '@common/user';
import { UpdateUserInformation } from '@src/app/models/UserMeta';
import { SocketService } from '../socket/socket.service';
//import { User } from '@models/UserMeta';
//import { UserToken } from '../static-services/user_token';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000/';
// const CONNECTION_PATH = 'connection/connect/';
// const DISCONNECTION_PATH = 'connection/disconnect/';
const REGISTER_PATH = 'register/';
const LOGIN_PATH = 'login/';
const DISCONNECT_PATH = 'user/disconnect/';
const PROFILE_PATH = 'user/profile/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // login error codes
  readonly USER_LOGGED_IN = 'User is already logged in';
  readonly NO_USER_FOUND = 'There is no account with this username or email';
  readonly INCORRECT_PASSWORD = 'Incorrect password';

  // register error codes
  readonly DUPLICATE_EMAIL =
    'duplicate key value violates unique constraint "UQ_c7a8d184ab23d7ebdc29453832a"';
  readonly DUPLICATE_USERNAME =
    'duplicate key value violates unique constraint "UQ_31b55a63ebb518f30d7e20dc922"';

  token$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private httpClient: HttpClient, private socketService: SocketService) {}

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
    return this.httpClient
      .post(PATH + LOGIN_PATH, user, { responseType: 'text' })
      .pipe(
        tap((token) => {
          this.authenticateUser(token);
        })
      );
  }

  register(user: UserRegistrationInfo): Observable<string> {
    return this.httpClient
      .post(PATH + REGISTER_PATH, user, { responseType: 'text' })
      .pipe(
        tap((token) => {
          this.authenticateUser(token);
        })
      );
  }

  // this.authentifiedUser.next(this.NULL_USER);
  disconnect(): Observable<string> {
    return this.httpClient
      .post(PATH + DISCONNECT_PATH + this.token$.value, null, {
        responseType: 'text',
      })
      .pipe(
        tap(() => {
          this.token$.next('');
          this.socketService.disconnect();
        })
      );
  }

  getToken() {
    return this.token$.value;
  }

  private authenticateUser(token: string) {
    if (token) this.token$.next(token);
  }

  public updateUserProfile(updatedUserProfile: UpdateUserInformation) {
    return this.httpClient
      .put(PATH + PROFILE_PATH + this.token$.value, updatedUserProfile, {
        responseType: 'text',
      });
  }

  // A little bit weird you dont need that
  // passer socket id et username
  /* {
    socket_id: this.chat.getSocketID(),
    username: username,
  } */
}
