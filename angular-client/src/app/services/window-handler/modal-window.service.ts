import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  dialogConfig: MatDialogConfig;

  constructor(private dialog: MatDialog) {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.id = 'modalWindow';
    this.dialogConfig.height = '70vh';
    this.dialogConfig.width = '20vw';
    this.dialogConfig.minWidth = '400px';
    this.dialogConfig.maxWidth = '25vw';
    this.dialogConfig.disableClose = false;
    this.dialogConfig.hasBackdrop = true;
    this.dialogConfig.restoreFocus = false;
  }

  openWindow(component: ComponentType<NewDrawingComponent>) {
    this.closeWindow();
    this.dialog.open(component, this.dialogConfig);
  }

  closeWindow() {
    this.dialog.closeAll();
  }
}
