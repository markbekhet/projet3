import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { GalleryComponent } from '@components/gallery-component/gallery.component';

type Component = ComponentType<NewDrawingComponent | GalleryComponent>;

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  newDrawingDialogConfig: MatDialogConfig = new MatDialogConfig();
  galleryDialogConfig: MatDialogConfig = new MatDialogConfig();

  constructor(private dialog: MatDialog) {
    this.initNewDrawingDialogConfig();
    this.initGalleryDialogConfig();
  }

  initNewDrawingDialogConfig() {
    this.newDrawingDialogConfig.id = 'newDrawingDialog';
    this.newDrawingDialogConfig.height = '84vh';
    this.newDrawingDialogConfig.width = '35vw';
    this.newDrawingDialogConfig.minWidth = '470px';
    this.newDrawingDialogConfig.maxWidth = '480px';
    this.newDrawingDialogConfig.maxHeight = '720px';
    this.newDrawingDialogConfig.disableClose = false;
    this.newDrawingDialogConfig.hasBackdrop = true;
    this.newDrawingDialogConfig.restoreFocus = false;
  }

  initGalleryDialogConfig() {
    this.galleryDialogConfig.id = 'galleryDialog';
    this.galleryDialogConfig.height = '84vh';
    this.galleryDialogConfig.width = '70vw';
    this.galleryDialogConfig.minWidth = '600px';
    this.galleryDialogConfig.disableClose = false;
    this.galleryDialogConfig.hasBackdrop = true;
    this.galleryDialogConfig.restoreFocus = false;
  }

  openDialog(component: Component) {
    this.closeDialogs();
    switch (component) {
      case NewDrawingComponent:
        this.dialog.open(NewDrawingComponent, this.newDrawingDialogConfig);
        break;
      case GalleryComponent:
        this.dialog.open(GalleryComponent, this.galleryDialogConfig);
        break;
      default:
        break;
    }
  }

  closeDialogs() {
    this.dialog.closeAll();
  }
}
