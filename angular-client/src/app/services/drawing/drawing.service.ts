/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Drawing /* , DrawingInfosForGallery */ } from '@models/DrawingMeta';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor(private httpClient: HttpClient) {}

  drawingId$ = new BehaviorSubject<number>(0);
  drawingName$ = new BehaviorSubject<string>('');

  getActiveDrawingID() {
    return this.drawingId$.value;
  }

  getActiveDrawingName() {
    return this.drawingName$.value;
  }

  createDrawing(newDrawing: Drawing): Observable<number> {
    return this.httpClient.post<number>(`${PATH}/drawing`, newDrawing).pipe(
      tap((drawingId) => {
        console.log(drawingId);
        this.drawingId$.next(drawingId);
      })
    );
  }

  deleteDrawing(drawingToDelete: { drawingId: number; userId: string }) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: drawingToDelete,
    };
    return this.httpClient.delete(`${PATH}/drawing`, httpOptions).pipe(
      tap((returnedDrawing) => {
        console.log(returnedDrawing);
      })
    );
  }

  // @Delete()
  //   async deleteDrawing(@Body() deleteInformation: DeleteDrawingDto){
  //       let drawing = await this.databaseService.deleteDrawing(deleteInformation);
  //       await this.chatGateway.notifyDrawingDeleted(drawing);
  //       return drawing.id;
  //   }

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
