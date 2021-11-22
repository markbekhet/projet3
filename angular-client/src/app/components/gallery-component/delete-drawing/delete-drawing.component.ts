import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingInfosForGallery } from '@models/DrawingMeta';
// import { DrawingService } from '@services/drawing/drawing.service';

@Component({
  templateUrl: './delete-drawing.component.html',
  styleUrls: ['./delete-drawing.component.scss'],
})
export class DeleteDrawingComponent implements OnInit {
  constructor(
    // private drawingService: DrawingService,
    @Inject(MAT_DIALOG_DATA) public drawingToDelete: DrawingInfosForGallery
  ) {}

  ngOnInit(): void {}

  // deleteDrawing(drawingToDelete: DrawingInfosForGallery) {
  //   this.drawingService.deleteDrawing(drawingToDelete);
  // }
}
