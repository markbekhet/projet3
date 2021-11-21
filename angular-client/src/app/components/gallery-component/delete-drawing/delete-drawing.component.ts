import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingInfosForGallery } from '@models/DrawingMeta';
import { DrawingService } from '@services/drawing/drawing.service';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { ErrorDialogComponent } from '../../error-dialog/error-dialog.component';

@Component({
  templateUrl: './delete-drawing.component.html',
  styleUrls: ['./delete-drawing.component.scss'],
})
export class DeleteDrawingComponent implements OnInit {

  userId: string;
  constructor(
     private drawingService: DrawingService,
     private authService: AuthService,
     private errorDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public drawingToDelete: DrawingInfosForGallery
  ) {
    this.userId = this.authService.token$.value;
  }

  ngOnInit(): void {}

  // deleteDrawing(drawingToDelete: DrawingInfosForGallery) {
  //   this.drawingService.deleteDrawing(drawingToDelete);
  // }
  deleteDrawing(){
    this.drawingService.deleteDrawing({drawingId: this.drawingToDelete.id, userId: this.userId}).subscribe((respomse)=>{

    },
    (error)=>{
      this.errorDialog.open(ErrorDialogComponent, {data:error.message});
    });
  }
}
