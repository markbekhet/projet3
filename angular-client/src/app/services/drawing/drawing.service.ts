/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Drawing } from '@models/DrawingMeta';
import { BehaviorSubject, Observable} from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActiveDrawing } from '../static-services/user_token';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor(private httpClient: HttpClient) {}

  readonly id: number = 0
  readonly name: string = ''
  drawingId: BehaviorSubject<number> = new BehaviorSubject<number>(this.id)
  drawingName: BehaviorSubject<string> = new BehaviorSubject<string>(this.name);
  
  createDrawing(newDrawing: Drawing): Observable<number>{
    //let drawingID!: number;
    return this.httpClient
      .post<number>(`${PATH}/drawing`, newDrawing)
      .pipe(
        tap((token)=>{
          console.log(token);
          ActiveDrawing.drawingId = token;
          this.drawingId.next(token);
        })
      )
  }

  // async createDrawing(newDrawing: Drawing): Promise<string | undefined> {
  //   let drawingId: string | undefined;
  //   this.httpClient.post(`${PATH}/drawing`, newDrawing).subscribe(
  //     (data) => {
  //       drawingId = data.toString();
  //       console.log(data);
  //     },
  //     (error) => {
  //       console.log(error.message);
  //     }
  //   );
  //   return drawingId;
  // }
}
