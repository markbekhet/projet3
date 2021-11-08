/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Drawing } from '@models/DrawingMeta';

// const PATH = 'http://projet3-101.eastus.cloudapp.azure.com:3000/';
const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class DrawingService {
  constructor(private httpClient: HttpClient) {}

  async createDrawing(newDrawing: Drawing){
    //let drawingID!: number;
    return this.httpClient.post<number>(`${PATH}/drawing`, newDrawing).toPromise();
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
