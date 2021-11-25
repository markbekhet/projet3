import { Injectable } from '@angular/core';
import { Avatar } from '@src/app/models/UserMeta';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  encodeImageFileAsURL(avatar: Avatar) {
    return this.http.get(avatar.url, { responseType: 'blob' });
  }

  removeHeader(base64: string) {
    const base64NoHeader = base64.split(";");
    console.log(base64NoHeader);
    return base64NoHeader[1].slice(7);
  }

  decodeAvatar(base64: string) {
    const byteCharacters = atob(base64);

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'image/png'});
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  }
}
