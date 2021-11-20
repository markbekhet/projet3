import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Team } from '@src/app/models/teamsMeta';
import { TeamVisibilityItem, teamVisibilityItems, TeamVisibilityLevel } from '@src/app/models/VisibilityMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { TeamService } from '@src/app/services/team/team.service';
import { SocketService } from '@src/app/services/socket/socket.service';
//import { ModalWindowService } from '@src/app/services/window-handler/modal-window.service';

@Component({
  selector: 'app-new-team-dialog',
  templateUrl: './new-team-dialog.component.html',
  styleUrls: ['./new-team-dialog.component.scss']
})
export class NewTeamDialogComponent implements OnInit {
  newTeamForm!: FormGroup;
  teamVisibilityItems: TeamVisibilityItem[];
  teamVisibility = new FormControl(null, Validators.required)
  showPasswordRequired: boolean = false;

  name: string = '';
  visibility: TeamVisibilityLevel = TeamVisibilityLevel.PUBLIC;
  password?: string = "";
  nbCollaborators: number = 4;
  userId: string;
  newTeam :Team ={
    name:'',
    password: undefined,
    ownerId: undefined,
    nbCollaborators: 4,
    visibility: TeamVisibilityLevel.PUBLIC,
  }
  bio: string = '';
  inputEntered: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    //private windowService: ModalWindowService,
    private readonly socketSeervice: SocketService,
    private teamService: TeamService,
    private authService: AuthService
  ) {
    this.userId = '';
    this.teamVisibilityItems = teamVisibilityItems

   }

  ngOnInit(): void {
    this.inputEntered = true;
    this.initForm();
    this.userId  = this.authService.token$.value;
  }
  initForm(){
    this.newTeamForm = this.formBuilder.group({
      teamName:['', [Validators.required]],
      teamVisibility: [TeamVisibilityLevel.PUBLIC,[Validators.required]],
      teamPassword:['', []],
      maxCollaborators:[4, [Validators.required, Validators.min(4)]],
      teamBio: ['', []]

    })
  }
  showVisibilityHint(): string{
    /*switch(this.visibility){
      case 0:
        return this.teamVisibilityItems[0].desc;
      case 1:
        return this.teamVisibilityItems[1].desc;
      default:
        return "";
    }*/
    return this.teamVisibilityItems[this.visibility].desc
  }
  showPasswordInput(): boolean{
    return this.visibility === TeamVisibilityLevel.PROTECTED;
  }
  onSubmit(){
    const values = this.newTeamForm.value;

    if(values.teamPassword === ''){
      values.teamPassword = null;
    }

    this.newTeam = {
      name: values.teamName,
      visibility: values.teamVisibility,
      password: values.teamPassword,
      ownerId: this.userId,
      nbCollaborators: values.maxCollaborators,
      bio: values.teamBio,
    }
    this.teamService.createTeam(this.newTeam).subscribe((team)=>{
      this.teamService.requestedTeamToJoin.next(this.newTeam);
      this.socketSeervice.sendRequestJoinTeam({teamName: this.newTeam.name!, userId: this.userId, password: this.newTeam.password});
    });
    console.log(this.newTeam);
    this.closeModal();

  }
  closeModal(){
    //this.windowService.closeWindow();
  }
  blockEvent(e: KeyboardEvent) {
    e.stopPropagation();
    this.inputEntered = false;
  }
}
