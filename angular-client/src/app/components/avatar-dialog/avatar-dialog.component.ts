import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Avatar, avatarList } from '@src/app/models/UserMeta';
import { RegisterPage } from '../register-page/register-page.component';

@Component({
  selector: 'app-avatar-dialog',
  templateUrl: './avatar-dialog.component.html',
  styleUrls: ['./avatar-dialog.component.scss']
})
export class AvatarDialogComponent implements OnInit {

  avatarList: Avatar[];
  selectedAvatar: Avatar = avatarList[0];

  constructor(public registerRef: MatDialogRef<RegisterPage>) {
    this.avatarList = avatarList;
  }

  ngOnInit(): void {
  }

  selectAvatar(avatar: string) {
    for (let i = 0; i < 10; i++) {
      if (avatarList[i].filename === avatar) {
        this.selectedAvatar = avatarList[i];
        break;
      }
    }
  }

  onSubmit() {
    this.registerRef.close(this.selectedAvatar);
  }

}
