import { Injectable } from '@angular/core';
import { Avatar } from '@src/app/models/UserMeta';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(private http: HttpClient) { }

  encodeImageFileAsURL(avatar: Avatar) {
    return this.http.get(avatar.url, { responseType: 'blob' });
  }

  removeHeader(base64: string) {
    const base64NoHeader = base64.split(";");
    console.log(base64NoHeader);
    return base64NoHeader[1].slice(7);
  }
}
