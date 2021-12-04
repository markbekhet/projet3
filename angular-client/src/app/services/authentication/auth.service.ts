import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { /* catchError, */ tap } from 'rxjs/operators';

import { UserRegistrationInfo, UserCredentials } from '@common/user';
import { /* Drawing, */ DrawingInfosForGallery } from '@models/DrawingMeta';
import { UpdateUserInformation } from '@models/UserMeta';
import { SocketService } from '@services/socket/socket.service';
import { DrawingService } from '../drawing/drawing.service';
import { TeamService } from '../team/team.service';
import { TeamInformations } from '@src/app/models/teamsMeta';

const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
//const PATH = 'http://localhost:3000/';
const LOGIN = 'login/';
const REGISTER = 'register/';
const PROFILE = 'user/profile/';
const DISCONNECT = 'user/disconnect/';
const GALLERY = 'user/gallery/';

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

  readonly NULL_DRAWINGS: DrawingInfosForGallery[] = [];

  token$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  userDrawings$ = new BehaviorSubject<DrawingInfosForGallery[]>(
    this.NULL_DRAWINGS
  );

  constructor(
    private httpClient: HttpClient,
    private socketService: SocketService,
    private drawingService: DrawingService,
    private teamService: TeamService,
  ) {}

  getUserToken() {
    return this.token$.value;
  }

  private authenticateUser(token: string) {
    if (token) this.token$.next(token);
  }

  login(userCreds: UserCredentials) {
    return this.httpClient
      .post(PATH + LOGIN, userCreds, { responseType: 'text' })
      .pipe(
        tap((token) => {
          this.authenticateUser(token);
        })
      );
  }

  register(userInfos: UserRegistrationInfo): Observable<string> {
    return this.httpClient
      .post(PATH + REGISTER, userInfos, { responseType: 'text' })
      .pipe(
        tap((token) => {
          this.authenticateUser(token);
        })
      );
  }

  disconnect(): Observable<string> {
    return this.httpClient
      .post(PATH + DISCONNECT + this.getUserToken(), null, {
        responseType: 'text',
      })
      .pipe(
        tap(() => {
          if(this.drawingService.drawingName$.value !== ""){
            this.socketService.leaveDrawing({drawingId: this.drawingService.drawingId$.value, userId: this.token$.value})
          }
          this.teamService.activeTeams.value.forEach((team: TeamInformations)=>{
            this.socketService.leaveTeam({teamName: team.name, userId: this.token$.value})
            this.teamService.activeTeams.value.delete(team.name);
          })
          this.token$.next('');
          this.userDrawings$.next(this.NULL_DRAWINGS);
          this.socketService.teams$.value.clear();
          this.socketService.users$.value.clear();
          this.socketService.disconnect();
        })
      );
  }

  getPersonalGallery(): Observable<{ drawingList: DrawingInfosForGallery[] }> {
    return this.httpClient
      .get<{ drawingList: DrawingInfosForGallery[] }>(
        PATH + GALLERY + this.getUserToken()
      )
      .pipe(
        tap((data) => {
          this.userDrawings$.next(data.drawingList);
        })
      );
  }

  public updateUserProfile(updatedUserProfile: UpdateUserInformation) {
    return this.httpClient.put(
      PATH + PROFILE + this.getUserToken(),
      updatedUserProfile,
      {
        responseType: 'text',
      }
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
