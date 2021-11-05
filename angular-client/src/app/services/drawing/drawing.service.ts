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
}
