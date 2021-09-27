import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  constructor(private httpClient: HttpClient) { 

  }

  connectClient(username: string):Observable<string> {
    //http://localhost:3000/connection/connect/
    //let username_encoded = encodeURI(username);
    //console.log(username_encoded);
    return this.httpClient.post<string>('http://localhost:3000/connection/connect/' + username, username);
  }
}
