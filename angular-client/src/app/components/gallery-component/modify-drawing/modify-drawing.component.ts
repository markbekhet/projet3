import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingInfosForGallery } from '@models/DrawingMeta';
import { DrawingVisibilityItem, drawingVisibilityItems, DrawingVisibilityLevel } from '@src/app/models/VisibilityMeta';
import { DrawingService } from '@src/app/services/drawing/drawing.service';
import { ErrorDialogComponent } from '../../error-dialog/error-dialog.component';

@Component({
  selector: 'app-modify-drawing',
  templateUrl: './modify-drawing.component.html',
  styleUrls: ['./modify-drawing.component.scss'],
})
export class ModifyDrawingComponent implements OnInit {
  newName: string| undefined;
  newVisibility: DrawingVisibilityLevel| undefined;
  password: string| undefined;
  passwordIsRequired = false;
  drawingVisibilityItems: DrawingVisibilityItem[]
  constructor(
    private drawingService: DrawingService,
    private errorDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public drawingToModify: DrawingInfosForGallery
  ) {
    this.drawingVisibilityItems = drawingVisibilityItems;
  } // private drawingService: DrawingService,

  ngOnInit(): void {}

  // submit() {
  // modifyDrawing(drawingToModify: DrawingInfosForGallery) {
  //   this.drawingService.modifyDrawing(drawingToModify);
  // }
  // }

  modifyDrawing(){
    console.log(this.newName, this.newVisibility, this.password);
    this.drawingService.modifyDrawing({userId: this.drawingToModify.ownerId!, drawingId: this.drawingToModify.id,
       newName: this.newName, newVisibility: this.newVisibility, password: this.password}).subscribe((response)=>{

       },
       (error)=>{
        this.errorDialog.open(ErrorDialogComponent, {data:error.message});
       })
  }
  errorInForm(){
    if(this.newName ===undefined && this.newVisibility=== undefined){
      return true;
    }
    else if(this.newVisibility === DrawingVisibilityLevel.PROTECTED && this.password === undefined){
      return true;
    }
    return false;
  }
}
