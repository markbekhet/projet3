/* eslint-disable no-case-declarations */
import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { AvatarDialogComponent } from '@components/avatar-dialog/avatar-dialog.component';
import { DeleteDrawingComponent } from '@components/gallery-component/delete-drawing/delete-drawing.component';
import { ModifyDrawingComponent } from '@components/gallery-component/modify-drawing/modify-drawing.component';
import { NewDrawingComponent } from '@components/new-drawing-dialog/new-drawing.component';
import { NewTeamDialogComponent } from '@components/new-team-dialog/new-team-dialog.component';
import { UserProfileDialogComponent } from '@components/user-profile-dialog/user-profile-dialog.component';
import { TeamMembersListComponent } from '@components/user-team-list/team-members-list/team-members-list.component';

type Component = ComponentType<
  | NewDrawingComponent
  | ModifyDrawingComponent
  | DeleteDrawingComponent
  | NewTeamDialogComponent
  | UserProfileDialogComponent
  | AvatarDialogComponent
  | TeamMembersListComponent
>;

@Injectable({
  providedIn: 'root',
})
export class ModalWindowService {
  newDrawingConfig = new MatDialogConfig();
  modifyDrawingConfig = new MatDialogConfig();
  deleteDrawingConfig = new MatDialogConfig();
  newTeamConfig = new MatDialogConfig();
  userProfileConfig = new MatDialogConfig();
  avatarConfig = new MatDialogConfig();
  teamMembersListConfig = new MatDialogConfig();

  constructor(private dialog: MatDialog) {
    this.initNewDrawingDialogConfig();
    this.initModifyDrawingDialogConfig();
    this.initDeleteDrawingDialogConfig();
    this.initNewTeamDialogConfig();
    this.initUserProfileDialogConfig();
    this.initAvatarDialogConfig();
    this.initTeamMembersListDialogConfig();
  }

  initNewDrawingDialogConfig() {
    this.newDrawingConfig.id = 'newDrawingDialog';
    this.newDrawingConfig.height = '80vh';
    this.newDrawingConfig.width = '35vw';
    this.newDrawingConfig.minWidth = '470px';
    this.newDrawingConfig.maxWidth = '480px';
    this.newDrawingConfig.maxHeight = '720px';
    this.newDrawingConfig.disableClose = false;
    this.newDrawingConfig.hasBackdrop = true;
    this.newDrawingConfig.restoreFocus = false;
  }

  // initGalleryDialogConfig() {
  //   this.galleryConfig.id = 'galleryDialog';
  //   this.galleryConfig.height = '90vh';
  //   this.galleryConfig.width = '85vw';
  //   this.galleryConfig.minWidth = '600px';
  //   this.galleryConfig.disableClose = false;
  //   this.galleryConfig.hasBackdrop = true;
  //   this.galleryConfig.restoreFocus = false;
  // }

  initModifyDrawingDialogConfig() {
    this.modifyDrawingConfig.id = 'modifyDrawingDialog';
    this.modifyDrawingConfig.height = '30vh';
    this.modifyDrawingConfig.width = '30vw';
    this.modifyDrawingConfig.minWidth = '600px';
    this.modifyDrawingConfig.disableClose = false;
    this.modifyDrawingConfig.hasBackdrop = true;
    this.modifyDrawingConfig.restoreFocus = false;
    this.modifyDrawingConfig.data = undefined;
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

  initNewTeamDialogConfig() {
    this.newTeamConfig.id = 'newTeamConfig';
    this.newTeamConfig.height = '72vh';
    this.newTeamConfig.width = '35vw';
    this.newTeamConfig.minWidth = '470px';
    this.newTeamConfig.maxWidth = '480px';
    this.newTeamConfig.maxHeight = '720px';
    this.newTeamConfig.disableClose = false;
    this.newTeamConfig.hasBackdrop = true;
    this.newTeamConfig.restoreFocus = false;
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
    this.avatarConfig.height = '52vh';
    this.avatarConfig.width = '44vw';
    this.avatarConfig.minWidth = '700px';
    this.avatarConfig.disableClose = false;
    this.avatarConfig.hasBackdrop = true;
    this.avatarConfig.restoreFocus = false;
  }

  initTeamMembersListDialogConfig() {
    this.teamMembersListConfig.id = 'teamMembersListDialog';
    this.teamMembersListConfig.height = '50vh';
    this.teamMembersListConfig.width = '35vw';
    this.teamMembersListConfig.minWidth = '470px';
    this.teamMembersListConfig.maxWidth = '480px';
    this.teamMembersListConfig.maxHeight = '720px';
    this.teamMembersListConfig.disableClose = false;
    this.teamMembersListConfig.hasBackdrop = true;
    this.teamMembersListConfig.restoreFocus = false;
  }

  openDialog(component: Component, data?: any) {
    switch (component) {
      case NewDrawingComponent:
        this.closeDialogs();
        this.dialog.open(NewDrawingComponent, this.newDrawingConfig);
        break;

      case ModifyDrawingComponent:
        this.modifyDrawingConfig.data = data;
        this.dialog.open(ModifyDrawingComponent, this.modifyDrawingConfig);
        break;

      case DeleteDrawingComponent:
        this.deleteDrawingConfig.data = data;
        this.dialog.open(DeleteDrawingComponent, this.deleteDrawingConfig);
        break;

      case NewTeamDialogComponent:
        this.closeDialogs();
        this.dialog.open(NewTeamDialogComponent, this.newTeamConfig);
        break;

      case UserProfileDialogComponent:
        this.closeDialogs();
        this.userProfileConfig.data = data;
        this.dialog.open(UserProfileDialogComponent, this.userProfileConfig);
        break;

      case AvatarDialogComponent:
        this.closeDialogs();
        const ref = this.dialog.open(AvatarDialogComponent, this.avatarConfig);
        return ref;

      case TeamMembersListComponent:
        this.closeDialogs();
        this.teamMembersListConfig.data = data;
        this.dialog.open(TeamMembersListComponent, this.teamMembersListConfig);
        break;

      default:
        break;
    }
    return null;
  }

  closeDialogs() {
    this.dialog.closeAll();
  }
}
