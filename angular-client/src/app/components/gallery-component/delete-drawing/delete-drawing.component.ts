import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingInfosForGallery } from '@models/DrawingMeta';
import { DrawingService } from '@services/drawing/drawing.service';
import { ErrorDialogComponent } from '../../error-dialog/error-dialog.component';

@Component({
  templateUrl: './delete-drawing.component.html',
  styleUrls: ['./delete-drawing.component.scss'],
})
export class DeleteDrawingComponent implements OnInit {
  constructor(
    private drawingService: DrawingService,
    private errorDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public drawingToDelete: DrawingInfosForGallery
  ) {}

  ngOnInit(): void {}

  deleteDrawing() {
    this.drawingService
      .deleteDrawing({
        drawingId: this.drawingToDelete.id,
        userId: this.drawingToDelete.ownerId!,
      })
      .subscribe(
        (response) => {},
        (error) => {
          this.errorDialog.open(ErrorDialogComponent, { data: error.message });
        }
      );
  }
}
