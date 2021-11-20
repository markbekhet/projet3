import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { /* catchError, */ tap } from 'rxjs/operators';

import { UserRegistrationInfo, UserCredentials } from '@common/user';
import { User } from '@models/UserMeta';
import { /* Drawing, */ DrawingInfosForGallery } from '@models/DrawingMeta';
import { UserToken } from '../static-services/user_token';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000/';
const LOGIN = 'login/';
const REGISTER = 'register/';
const PROFILE = 'user/profile/';
const DISCONNECT = 'user/disconnect/';
const GALLERY = 'user/gallery/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  // login error codes
  readonly USER_LOGGED_IN = 'User is already logged in';
  readonly NO_USER_FOUND = 'There is no account with this username or email';
  readonly INCORRECT_PASSWORD = 'Incorrect password';

  // register error codes
  readonly DUPLICATE_EMAIL =
    'duplicate key value violates unique constraint "UQ_c7a8d184ab23d7ebdc29453832a"';
  readonly DUPLICATE_USERNAME =
    'duplicate key value violates unique constraint "UQ_31b55a63ebb518f30d7e20dc922"';

  readonly NULL_USER: User = { id: '' };
  readonly NULL_DRAWINGS: DrawingInfosForGallery[] = [];

  $authenticatedUser = new BehaviorSubject<User>(this.NULL_USER);

  $userDrawings = new BehaviorSubject<DrawingInfosForGallery[]>(
    this.NULL_DRAWINGS
  );

  getAuthenticatedUserID() {
    return this.$authenticatedUser.value.id;
  }

  private authenticateUser(user: User) {
    if (user.id) this.$authenticatedUser.next(user);
  }

  login(userCreds: UserCredentials) {
    return this.httpClient
      .post(PATH + LOGIN, userCreds, { responseType: 'text' })
      .pipe(
        tap((token) => {
          const loggedInUser: User = {
            id: token,
          };
          UserToken.userToken = token;
          console.log(token);
          this.authenticateUser(loggedInUser);
        })
      );
  }

  register(userInfos: UserRegistrationInfo): Observable<string> {
    return this.httpClient
      .post(PATH + REGISTER, userInfos, { responseType: 'text' })
      .pipe(
        tap((token) => {
          const registeredUser: User = {
            id: token,
          };
          UserToken.userToken = token;
          console.log(token);
          this.authenticateUser(registeredUser);
        })
      );
  }

  disconnect(): Observable<string> {
    return this.httpClient
      .post(PATH + DISCONNECT + this.$authenticatedUser.value.id, null, {
        responseType: 'text',
      })
      .pipe(
        tap((data) => {
          console.log(data);
          this.$authenticatedUser.next(this.NULL_USER);
          this.$userDrawings.next(this.NULL_DRAWINGS);
        })
      );
  }

  getProfile() {
    return this.httpClient.get<User>(
      `${PATH + PROFILE + this.$authenticatedUser.value.id}/${
        this.$authenticatedUser.value.id
      }`
    );
  }

  getPersonalGallery(): Observable<{ drawingList: DrawingInfosForGallery[] }> {
    return this.httpClient
      .get<{ drawingList: DrawingInfosForGallery[] }>(
        PATH + GALLERY + this.$authenticatedUser.value.id
      )
      .pipe(
        tap((data) => {
          this.$userDrawings.next(data.drawingList);
        })
      );
  }

  // .pipe(catchError(this.handleGalleryError('getDrawings', [])));

  // handleGalleryError(arg0: string, arg1: never[]): (err: any, caught: Observable<Drawing[]>) => import("rxjs").ObservableInput<any> {
  //   throw new Error('Method not implemented.');
  // }

  // A little bit weird you dont need that
  // passer socket id et username
  /* {
    socket_id: this.chat.getSocketID(),
    username: username,
  } */

  /* login(userCreds: UserCredentials) {
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
}
