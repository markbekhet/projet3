import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { DeleteDrawingComponent } from '@components/gallery-component/delete-drawing/delete-drawing.component';
import { GalleryComponent } from '@components/gallery-component/gallery.component';
import { ModifyDrawingComponent } from '@components/gallery-component/modify-drawing/modify-drawing.component';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { UserProfileDialogComponent } from '@src/app/components/user-profile-dialog/user-profile-dialog.component';
import { NewTeamDialogComponent } from '@src/app/components/new-team-dialog/new-team-dialog.component';
import { AvatarDialogComponent } from '@src/app/components/avatar-dialog/avatar-dialog.component';

type Component = ComponentType<
  | NewDrawingComponent
  | GalleryComponent
  | DeleteDrawingComponent
  | ModifyDrawingComponent
  | NewTeamDialogComponent
  | UserProfileDialogComponent
  | AvatarDialogComponent
>;

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  newDrawingConfig = new MatDialogConfig();
  newTeamConfig = new MatDialogConfig();
  deleteDrawingConfig = new MatDialogConfig();
  modifyDrawingConfig = new MatDialogConfig();
  galleryConfig = new MatDialogConfig();
  userProfileConfig = new MatDialogConfig();
  avatarConfig = new MatDialogConfig();

  constructor(private dialog: MatDialog) {
    this.initNewDrawingDialogConfig();
    this.initDeleteDrawingDialogConfig();
    this.initModifyDrawingDialogConfig();
    this.initGalleryDialogConfig();
    this.initNewTeamDialogConfig();
    this.initUserProfileDialogConfig();
    this.initAvatarDialogConfig();
  }

  initNewDrawingDialogConfig() {
    this.newDrawingConfig.id = 'newDrawingDialog';
    this.newDrawingConfig.height = '86vh';
    this.newDrawingConfig.width = '35vw';
    this.newDrawingConfig.minWidth = '470px';
    this.newDrawingConfig.maxWidth = '480px';
    this.newDrawingConfig.maxHeight = '720px';
    this.newDrawingConfig.disableClose = false;
    this.newDrawingConfig.hasBackdrop = true;
    this.newDrawingConfig.restoreFocus = false;
  }

  initNewTeamDialogConfig() {
    this.newTeamConfig.id = 'newTeamConfig';
    this.newTeamConfig.height = '86vh';
    this.newTeamConfig.width = '35vw';
    this.newTeamConfig.minWidth = '470px';
    this.newTeamConfig.maxWidth = '480px';
    this.newTeamConfig.maxHeight = '720px';
    this.newTeamConfig.disableClose = false;
    this.newTeamConfig.hasBackdrop = true;
    this.newTeamConfig.restoreFocus = false;
  }

  initDeleteDrawingDialogConfig() {
    this.deleteDrawingConfig.id = 'deleteDrawingDialog';
    this.deleteDrawingConfig.height = '30vh';
    this.deleteDrawingConfig.width = '50vw';
    this.deleteDrawingConfig.minWidth = '600px';
    this.deleteDrawingConfig.disableClose = false;
    this.deleteDrawingConfig.hasBackdrop = true;
    this.deleteDrawingConfig.restoreFocus = false;
    this.deleteDrawingConfig.data = undefined;
  }

  initModifyDrawingDialogConfig() {
    this.modifyDrawingConfig.id = 'modifyDrawingDialog';
    this.modifyDrawingConfig.height = '50vh';
    this.modifyDrawingConfig.width = '50vw';
    this.modifyDrawingConfig.minWidth = '600px';
    this.modifyDrawingConfig.disableClose = false;
    this.modifyDrawingConfig.hasBackdrop = true;
    this.modifyDrawingConfig.restoreFocus = false;
    this.modifyDrawingConfig.data = undefined;
  }

  initGalleryDialogConfig() {
    this.galleryConfig.id = 'galleryDialog';
    this.galleryConfig.height = '90vh';
    this.galleryConfig.width = '85vw';
    this.galleryConfig.minWidth = '600px';
    this.galleryConfig.disableClose = false;
    this.galleryConfig.hasBackdrop = true;
    this.galleryConfig.restoreFocus = false;
  }

  initUserProfileDialogConfig() {
    this.userProfileConfig.id = 'userProfileDialog';
    this.userProfileConfig.height = '50vh';
    this.userProfileConfig.width = '50vw';
    this.userProfileConfig.minWidth = '600px';
    this.userProfileConfig.disableClose = false;
    this.userProfileConfig.hasBackdrop = true;
    this.userProfileConfig.restoreFocus = false;
    this.userProfileConfig.data = undefined;
  }

  initAvatarDialogConfig() {
    this.avatarConfig.id = 'avatarDialog';
    this.avatarConfig.height = '90vh';
    this.avatarConfig.width = '85vw';
    this.avatarConfig.minWidth = '600px';
    this.avatarConfig.disableClose = false;
    this.avatarConfig.hasBackdrop = true;
    this.avatarConfig.restoreFocus = false;
  }

  openDialog(component: Component, data?: any) {
    switch (component) {
      case NewDrawingComponent:
        this.closeDialogs();
        this.dialog.open(NewDrawingComponent, this.newDrawingConfig);
        break;
      case NewTeamDialogComponent:
        this.closeDialogs();
        this.dialog.open(NewTeamDialogComponent, this.newTeamConfig);
        break;
      case DeleteDrawingComponent:
        this.deleteDrawingConfig.data = data;
        this.dialog.open(DeleteDrawingComponent, this.deleteDrawingConfig);
        break;
      case ModifyDrawingComponent:
        this.modifyDrawingConfig.data = data;
        this.dialog.open(ModifyDrawingComponent, this.modifyDrawingConfig);
        break;
      case GalleryComponent:
        this.closeDialogs();
        this.dialog.open(GalleryComponent, this.galleryConfig);
        break;
      case UserProfileDialogComponent:
        this.closeDialogs();
        this.userProfileConfig.data = data;
        this.dialog.open(UserProfileDialogComponent, this.userProfileConfig);
        break;
      case AvatarDialogComponent:
        this.closeDialogs();
        this.dialog.open(AvatarDialogComponent, this.avatarConfig);
        break;
       default:
        break;
    }
  }

  closeDialogs() {
    this.dialog.closeAll();
  }
}
