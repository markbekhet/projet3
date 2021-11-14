import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { /* catchError, */ tap } from 'rxjs/operators';

import { UserRegistrationInfo, UserCredentials } from '@common/user';
import { User } from '@models/UserMeta';
import { Drawing } from '@models/DrawingMeta';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000/';
const LOGIN = 'login/';
const REGISTER = 'register/';
const PROFILE = 'user/profile/';
const DISCONNECT = 'user/disconnect/';
const GALLERY = 'user/gallery/';

// TODO: à changer, juste pour tester
const PAUL_USER_ID = 'a7e2dd1a-4746-40e1-b3a0-b7b6f611600a';

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

  readonly NULL_USER: User = {
    token: '',
  };
  readonly NULL_DRAWINGS: Drawing[] = [];

  $authenticatedUser = new BehaviorSubject<User>(this.NULL_USER);

  $userDrawings = new BehaviorSubject<Drawing[]>(this.NULL_DRAWINGS);

  constructor(private httpClient: HttpClient) {}

  getAuthenticatedUserID() {
    return this.$authenticatedUser.value.token;
  }

  private authenticateUser(user: User) {
    if (user.token) this.$authenticatedUser.next(user);
  }

  login(userCreds: UserCredentials) {
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
      .post(PATH + LOGIN, userCreds, { responseType: 'text' })
      .pipe(
        tap((token) => {
          const loggedInUser: User = {
            token,
          };
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
            token,
          };
          this.authenticateUser(registeredUser);
        })
      );
  }

  // this.authentifiedUser.next(this.NULL_USER);
  disconnect(): Observable<string> {
    return this.httpClient.post(
      PATH + DISCONNECT + this.$authenticatedUser.value.token,
      this.$authenticatedUser.value.token,
      { responseType: 'text' }
    );
  }

  getProfile() {
    return this.httpClient.get<User>(
      PATH + PROFILE + this.$authenticatedUser.value.token
    );
  }

  getPersonalGallery(): Observable<Drawing[]> {
    return this.httpClient.get<Drawing[]>(PATH + GALLERY + PAUL_USER_ID, {
      responseType: 'json',
    });
  }

  // .pipe(catchError(this.handleGalleryError('getDrawings', [])));

  // handleGalleryError(arg0: string, arg1: never[]): (err: any, caught: Observable<Drawing[]>) => import("rxjs").ObservableInput<any> {
  //   throw new Error('Method not implemented.');
  // }

  // @Get("/gallery/:userId")
  //   async getUserGallery(@Param("userId") userId: string){
  //       return await this.databaseService.getUserDrawings(userId);
  //   }

  // A little bit weird you dont need that
  // passer socket id et username
  /* {
    socket_id: this.chat.getSocketID(),
    username: username,
  } */
}
