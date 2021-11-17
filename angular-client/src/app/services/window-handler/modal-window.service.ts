import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { NewTeamDialogComponent } from '@src/app/components/new-team-dialog/new-team-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  dialogConfig: MatDialogConfig;

  constructor(private dialog: MatDialog) {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.id = 'modalWindow';
    this.dialogConfig.height = '84vh';
    this.dialogConfig.width = '35vw';
    this.dialogConfig.minWidth = '470px';
    this.dialogConfig.disableClose = false;
    this.dialogConfig.hasBackdrop = true;
    this.dialogConfig.restoreFocus = false;
  }

  openWindow(component: ComponentType<NewDrawingComponent | NewTeamDialogComponent>) {
    this.closeWindow();
    this.dialog.open(component, this.dialogConfig);
  }

  closeWindow() {
    this.dialog.closeAll();
  }
}
