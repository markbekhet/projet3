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

  readonly NULL_USER: User = {
    token: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  }
  authentifiedUser: BehaviorSubject<User> = new BehaviorSubject<User>(this.NULL_USER);

  constructor(private httpClient: HttpClient) {}

  login(user: UserCredentials) {
    /*
    
    console.log('login time');
    let request: Observable<string> = this.httpClient.post(PATH + LOGIN_PATH, user, { responseType: 'text' })
    .pipe(tap(responseData => {
      let profile = this.httpClient.get<any>(PATH + GET_PROFILE_PATH + responseData).subscribe(profile => {


        const registeredUser: User = {
          token: responseData,
          firstName: profile.firstName,
          lastName: '',
          username: user.username,
          email: '',
          password: user.password
        };
      });

      

      }));
    //tap(res => console.log('First result', res)),
    //concatMap((res: { timeout: number }) => this.http.get(`http://test.localhost/api.php?timeout=${+res.timeout + 1}`)),
    
    
    return request;*/

    //this.authentifiedUser.next(registeredUser);
    let registeredUser: User = {
      token: '',
      firstName: '',
      lastName: '',
      username: user.username,
      email: '',
      password: user.password
    };

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
    
  }

  register(user: UserRegistrationInfo): Observable<string> {
    return this.httpClient.post(PATH + REGISTER_PATH, user, { responseType: 'text' })
    .pipe(tap(responseData => {
      const registeredUser: User = {
        token: responseData,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.pseudo,
        email: user.emailAddress,
        password: user.password
      }
      this.authenticateUser(registeredUser);
    }));
  }

  //this.authentifiedUser.next(this.NULL_USER);
  disconnect(): Observable<string> {
    const token = this.authentifiedUser.value.token;
    console.log(token);
    //return this.httpClient.post(PATH + DISCONNECT_PATH + token, null, { responseType: 'text' })
    //.pipe(tap(() => this.authentifiedUser.next(this.NULL_USER)));
    return this.httpClient.post(PATH + DISCONNECT_PATH + token, null, { responseType: 'text' });
  }

  getProfile() {
    return this.httpClient.get<User>(PATH + GET_PROFILE_PATH + this.authentifiedUser.value.token);
  }

  //deprecated
  connectClient(username: string, password: string): Observable<string> {
    return this.httpClient.post<string>(PATH + '' + username, username);
  }

  //deprecated
  disconnectClient(username: string): Observable<string> {
    return this.httpClient.post<string>(PATH + '' + username, username);
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
