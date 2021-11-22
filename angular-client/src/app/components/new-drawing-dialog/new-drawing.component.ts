/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';

import { Drawing, JoinDrawing } from '@models/DrawingMeta';
import { Team } from '@models/teamsMeta';
import {
  drawingVisibilityItems,
  DrawingVisibilityItem,
  DrawingVisibilityLevel,
} from '@models/VisibilityMeta';

import { AuthService } from '@services/authentication/auth.service';
import { CanvasBuilderService } from '@services/canvas-builder/canvas-builder.service';
import { InteractionService } from '@services/interaction/interaction.service';
import { DrawingService } from '@services/drawing/drawing.service';
import { SocketService } from '@services/socket/socket.service';
import { TeamService } from '@services/team/team.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

@Component({
  templateUrl: './new-drawing.component.html',
  styleUrls: ['./new-drawing.component.scss'],
})
export class NewDrawingComponent implements OnInit {
  newDrawingForm!: FormGroup;
  inputEntered: boolean = false;
  drawingVisibilityItems: DrawingVisibilityItem[];
  drawingVisibility = new FormControl(null, Validators.required);
  showPasswordRequired: boolean = false;

  currentTeams: Team[] = [];
  assignedToTeam: boolean = false;
  assignedTeam: Team | null = null;
  // drawingID?: number;
  name: string = '';
  visibility: DrawingVisibilityLevel | null = null;
  password?: string = '';
  width: number;
  height: number;
  bgColor: string;
  userId: string;

  newDrawing: Drawing = {
    drawingID: undefined,
    name: '',
    visibility: DrawingVisibilityLevel.PUBLIC,
    password: undefined,
    width: 0,
    height: 0,
    color: '',
    ownerId: undefined,
  };

  constructor(
    private authService: AuthService,
    private canvasBuilder: CanvasBuilderService,
    private drawingService: DrawingService,
    private formBuilder: FormBuilder,
    private router: Router,
    private teamService: TeamService,
    private windowService: ModalWindowService,
    private readonly socketService: SocketService,
    private readonly interactionService: InteractionService
  ) {
    this.width = this.canvasBuilder.getDefWidth();
    this.height = this.canvasBuilder.getDefHeight();
    this.bgColor = this.canvasBuilder.getDefColor();
    this.drawingVisibilityItems = drawingVisibilityItems;
    this.userId = '';
    this.teamService.activeTeams.value.forEach((team) => {
      this.currentTeams.push(team);
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.inputEntered = true;
    window.addEventListener('resize', () => {
      if (this.inputEntered) {
        this.resizeCanvas();
      }
    });
    this.authService.token$.subscribe((token) => {
      this.userId = token;
    });
  }

  blockEvent(e: KeyboardEvent) {
    e.stopPropagation();
    this.inputEntered = false;
  }

  resizeCanvas() {
    this.width = this.canvasBuilder.getDefWidth();
    this.height = this.canvasBuilder.getDefHeight();
  }

  initForm() {
    this.newDrawingForm = this.formBuilder.group({
      drawingName: ['', [Validators.required]],
      drawingVisibility: [null, [Validators.required]],
      drawingPassword: ['', []],
      canvWidth: [
        '',
        [Validators.pattern(/^\d+$/), Validators.min(1), Validators.required],
      ], // accepts only positive integers
      canvHeight: [
        '',
        [Validators.pattern(/^\d+$/), Validators.min(1), Validators.required],
      ],
      canvColor: ['', [Validators.pattern(/^[a-fA-F0-9]{6}$/)]], // only accepts 6-chars strings made of hex characters
      teamAssignation: [null, []],
    });
    this.newDrawingForm.setValue({
      drawingName: this.name,
      drawingVisibility: this.visibility,
      drawingPassword: this.password,
      canvWidth: this.canvasBuilder.getDefWidth(),
      canvHeight: this.canvasBuilder.getDefHeight(),
      canvColor: this.canvasBuilder.getDefColor(),
      teamAssignation: this.assignedTeam,
    });
  }

  showVisibilityHint(): string {
    switch (this.visibility) {
      case 0:
        return this.drawingVisibilityItems[0].desc;
      case 1:
        return this.drawingVisibilityItems[1].desc;
      case 2:
        return this.drawingVisibilityItems[2].desc;
      default:
        return '';
    }
  }

  showPasswordInput(): boolean {
    return this.visibility === DrawingVisibilityLevel.PROTECTED;
  }

  onSubmit() {
    const VALUES = this.newDrawingForm.value;

    if (VALUES.drawingPassword === '') {
      VALUES.drawingPassword = null;
    }

    this.newDrawing = {
      name: VALUES.drawingName,
      visibility: VALUES.drawingVisibility,
      password: VALUES.drawingPassword,
      width: VALUES.canvWidth,
      height: VALUES.canvHeight,
      color: VALUES.canvColor,
      ownerId: this.userId,
    };

    try {
      if (
        this.visibility === DrawingVisibilityLevel.PROTECTED &&
        VALUES.drawingPassword === null
      ) {
        throw new Error('Un mot de passe est requis');
      }
      if (this.assignedToTeam) {
        console.log(VALUES.teamAssignation.id);
        this.newDrawing.ownerId = VALUES.teamAssignation.id;
        if (VALUES.teamAssignation.id === undefined) {
          throw new Error('Le dessin doit etre assigne a une equipe');
        }
        console.log(this.assignedTeam!.id);
      }
      this.drawingService
        .createDrawing(this.newDrawing)
        .subscribe((drawingIdFromServer: number) => {
          console.log(drawingIdFromServer);
          const joinDrawing: JoinDrawing = {
            drawingId: drawingIdFromServer,
            userId: this.userId,
            password: this.password,
          };
          this.socketService.sendJoinDrawingRequest(joinDrawing);
          this.closeModalForm();
          this.interactionService.emitWipeSignal();
          this.router.navigate(['/draw']);

          const LOAD_TIME = 15;
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, LOAD_TIME);
        });
    } catch (err: any) {
      this.showPasswordRequired = true;
      console.error(err.message);
    }
  }

  closeModalForm(): void {
    this.windowService.closeDialogs();
  }

  get canvHeight(): AbstractControl | null {
    // basic accessors to get individual input validity in html
    return this.newDrawingForm.get('canvHeight');
  }

  get canvWidth(): AbstractControl | null {
    return this.newDrawingForm.get('canvWidth');
  }

  get canvColor(): AbstractControl | null {
    return this.newDrawingForm.get('canvColor');
  }

  updateColor(color: string): void {
    this.bgColor = color;
    this.newDrawingForm.patchValue({ canvColor: this.bgColor }); // updates value for form
  }

  onInput(): void {
    if (this.canvColor && this.canvColor.valid) {
      this.bgColor = this.canvColor.value;
    }
  }

  assignationStatusChange(event: Event) {
    if ((event as unknown as MatCheckboxChange).checked) {
      this.assignedToTeam = true;
    } else {
      this.assignedToTeam = false;
    }
  }
}
