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
    var byteCharacters = atob(base64);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += 512) {
      var slice = byteCharacters.slice(offset, offset + 512);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
         byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
   }

    var blob = new Blob(byteArrays, {
      type: 'image/png'
    });
    console.log(blob);

    const reader = new FileReader();
    reader.readAsDataURL(blob);

    const sanitizer = this.sanitizer;
    reader.onloadend = function() {
      const base64data = reader.result;
      return sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + base64data);
    }
  }
}
