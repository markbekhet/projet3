import { ComponentType } from '@angular/cdk/portal';
import { /* Component,  */ Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewDrawComponent } from 'src/app/components/new-draw/new-draw.component';

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  dialogConfig: MatDialogConfig;
  constructor(private dialog: MatDialog) {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.disableClose = false;
    this.dialogConfig.hasBackdrop = true;
    this.dialogConfig.id = 'modalWindow';
    this.dialogConfig.height = 'auto';
    this.dialogConfig.width = 'auto';
    this.dialogConfig.maxWidth = '100vw';
    this.dialogConfig.restoreFocus = false;
  }

  openWindow(component: ComponentType<NewDrawComponent>) {
    this.closeWindow();
    this.dialog.open(component, this.dialogConfig);
  }
  closeWindow() {
    this.dialog.closeAll();
  }
}
