/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Drawing /* , DrawingInfosForGallery */ } from '@models/DrawingMeta';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DrawingVisibilityLevel } from '@src/app/models/VisibilityMeta';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor(private httpClient: HttpClient) {}

  readonly NULL_ID: number = 0;
  readonly NULL_NAME: string = '';

  $drawingId = new BehaviorSubject<number>(this.NULL_ID);
  $drawingName = new BehaviorSubject<string>(this.NULL_NAME);

  createDrawing(newDrawing: Drawing): Observable<number> {
    return this.httpClient.post<number>(`${PATH}/drawing`, newDrawing).pipe(
      tap((token) => {
        console.log(token);
        this.$drawingId.next(token);
      })
    );
  }

   deleteDrawing(drawingToDelete: {drawingId: number, userId: string}) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: drawingToDelete
    }
     return this.httpClient.delete(`${PATH}/drawing`, httpOptions).pipe(
       tap((returnedDrawing) => {
         console.log(returnedDrawing);
       })
     );
  }

  modifyDrawing(newParameters: {userId: string, drawingId: number, newName?: string, newVisbility?: DrawingVisibilityLevel, password?: string}){
    return this.httpClient.put(`${PATH}/drawing`, newParameters)
  }

}
