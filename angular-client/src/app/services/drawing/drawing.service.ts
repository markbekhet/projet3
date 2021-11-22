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

  modifyDrawing(newParameters: {
    userId: string;
    drawingId: number;
    newName?: string;
    newVisibility?: DrawingVisibilityLevel;
    password?: string;
  }) {
    return this.httpClient.put(`${PATH}/drawing`, newParameters);
  }
}
