import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { Team, TeamCreation } from '@models/teamsMeta';
import {
  TeamVisibilityItem,
  teamVisibilityItems,
  TeamVisibilityLevel,
} from '@models/VisibilityMeta';
import { AuthService } from '@services/authentication/auth.service';
import { TeamService } from '@services/team/team.service';
import { SocketService } from '@services/socket/socket.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { ErrorDialogComponent } from '@components/error-dialog/error-dialog.component';
// import { ModalWindowService } from '@src/app/services/window-handler/modal-window.service';

@Component({
  selector: 'app-new-team-dialog',
  templateUrl: './new-team-dialog.component.html',
  styleUrls: ['./new-team-dialog.component.scss'],
})
export class NewTeamDialogComponent implements OnInit {
  newTeamForm!: FormGroup;
  teamVisibilityItems: TeamVisibilityItem[];
  teamVisibility = new FormControl(null, Validators.required);
  showPasswordRequired: boolean = false;

  name: string = '';
  visibility: TeamVisibilityLevel = TeamVisibilityLevel.PUBLIC;
  password?: string = '';
  nbCollaborators: number = 4;
  userId: string;
  newTeam: TeamCreation;
  bio: string = '';
  inputEntered: boolean = false;

  constructor(
    private authService: AuthService,
    private errorDialog: MatDialog,
    private formBuilder: FormBuilder,
    private socketService: SocketService,
    private teamService: TeamService,
    private windowService: ModalWindowService
  ) {
    this.userId = '';
    this.teamVisibilityItems = teamVisibilityItems;
    this.newTeam = {
      name: '',
      password: undefined,
      visibility: TeamVisibilityLevel.PUBLIC,
      ownerId: this.authService.getUserToken(),
      bio: undefined,
      nbCollaborators: 4,
    };
  }

  ngOnInit(): void {
    this.inputEntered = true;
    this.initForm();
    this.userId = this.authService.getUserToken();
  }

  initForm() {
    this.newTeamForm = this.formBuilder.group({
      teamName: ['', [Validators.required]],
      teamVisibility: [TeamVisibilityLevel.PUBLIC, [Validators.required]],
      teamPassword: ['', []],
      maxCollaborators: [4, [Validators.required, Validators.min(2)]],
      teamBio: ['', []],
    });
  }

  showVisibilityHint(): string {
    /* switch(this.visibility){
      case 0:
        return this.teamVisibilityItems[0].desc;
      case 1:
        return this.teamVisibilityItems[1].desc;
      default:
        return "";
    } */
    return this.teamVisibilityItems[this.visibility].desc;
  }

  showPasswordInput(): boolean {
    return this.visibility === TeamVisibilityLevel.PROTECTED;
  }

  onSubmit() {
    const values = this.newTeamForm.value;

    if (values.teamPassword === '') {
      values.teamPassword = null;
    }

    this.newTeam = {
      name: values.teamName,
      visibility: values.teamVisibility,
      password: values.teamPassword,
      ownerId: this.userId,
      nbCollaborators: values.maxCollaborators,
      bio: values.teamBio,
    };
    this.teamService.createTeam(this.newTeam).subscribe(
      (team: Team) => {
        const requestJoinTeam: Team = {
          id: team.id,
          name: team.name,
          visibility: this.newTeam.visibility,
          ownerId: this.newTeam.ownerId,
          bio: this.newTeam.bio,
        };
        this.teamService.requestedTeamToJoin.next(requestJoinTeam);
        this.socketService.sendRequestJoinTeam({
          teamName: this.newTeam.name!,
          userId: this.userId,
          password: this.newTeam.password,
        });
      },
      (error) => {
        const errorCode = JSON.parse(
          (error as HttpErrorResponse).error
        ).message;
        this.errorDialog.open(ErrorDialogComponent, { data: errorCode });
      }
    );
    console.log(this.newTeam);
    this.closeModal();
  }
  closeModal() {
    this.windowService.closeDialogs();
  }
  blockEvent(e: KeyboardEvent) {
    e.stopPropagation();
    this.inputEntered = false;
  }
}
