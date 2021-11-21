import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingInfosForGallery } from '@models/DrawingMeta';

@Component({
  selector: 'app-modify-drawing',
  templateUrl: './modify-drawing.component.html',
  styleUrls: ['./modify-drawing.component.scss'],
})
export class ModifyDrawingComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public drawingToDelete: DrawingInfosForGallery
  ) {} // private drawingService: DrawingService,

  ngOnInit(): void {}

  // submit() {
  // modifyDrawing(drawingToModify: DrawingInfosForGallery) {
  //   this.drawingService.modifyDrawing(drawingToModify);
  // }
  // }
}
