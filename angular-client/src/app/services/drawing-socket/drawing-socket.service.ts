/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Observable, Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { Drawing } from '@models/DrawingMeta';
// import { DrawingContent } from '@models/DrawingContent';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class DrawingSocketService {
  socket = io(PATH);

  constructor(private httpClient: HttpClient) {}

  createDrawing(newDrawing: Drawing) {
    this.httpClient.post(`${PATH}/drawing`, newDrawing).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        console.log(error.message);
      }
    );
  }

  // drawingElement: Subject<DrawingContent> = new Subject<DrawingContent>();
  // $drawingElements: Observable<DrawingContent> =
  //   this.drawingElement.asObservable();

  // selectedTool: Subject<string> = new Subject<string>();
  // $selectedTool: Observable<string> = this.selectedTool.asObservable();

  // drawing: Subject<DrawingContent> = new Subject<DrawingContent>();
  // $drawing: Observable<DrawingContent> = this.drawing.asObservable();

  // ref: Subject<ElementRef> = new Subject<ElementRef>();
  // $refObs: Observable<ElementRef> = this.ref.asObservable();

  public connect(): void {
    this.socket = io(PATH);
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  public getSocketID(): string {
    return this.socket.id;
  }
}
