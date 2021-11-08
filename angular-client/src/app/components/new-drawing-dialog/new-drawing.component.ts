/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Drawing } from '@models/DrawingMeta';
import {
  drawingVisibilityItems,
  DrawingVisibilityItem,
  DrawingVisibilityLevel,
} from '@models/VisibilityMeta';
import { CanvasBuilderService } from '@services/canvas-builder/canvas-builder.service';
//import { DrawingService } from '@services/drawing/drawing.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { JoinDrawing } from '@src/app/models/joinDrrawing';
import { DrawingService } from '@src/app/services/drawing/drawing.service';
import { SocketService } from '@src/app/services/socket/socket.service';
import { UserToken } from '@src/app/services/static-services/user_token';

@Component({
  selector: 'app-new-drawing',
  templateUrl: './new-drawing.component.html',
  styleUrls: ['./new-drawing.component.scss'],
})
export class NewDrawingComponent implements OnInit {
  newDrawingForm!: FormGroup;
  inputEntered: boolean = false;
  drawingVisibilityItems: DrawingVisibilityItem[];
  drawingVisibility = new FormControl(null, Validators.required);
  showPasswordRequired: boolean = false;

  //drawingID?: number;
  name: string = '';
  visibility: DrawingVisibilityLevel | null = null;
  password?: string = '';
  width: number;
  height: number;
  bgColor: string;

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
    private canvasBuilder: CanvasBuilderService,
    private drawingService: DrawingService,
    private formBuilder: FormBuilder,
    private router: Router,
    private windowService: ModalWindowService,
    private readonly socketService: SocketService,
  ) {
    this.width = this.canvasBuilder.getDefWidth();
    this.height = this.canvasBuilder.getDefHeight();
    this.bgColor = this.canvasBuilder.getDefColor();
    this.drawingVisibilityItems = drawingVisibilityItems;
  }

  ngOnInit(): void {
    this.initForm();
    this.inputEntered = true;
    window.addEventListener('resize', () => {
      if (this.inputEntered) {
        this.resizeCanvas();
      }
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
    });
    this.newDrawingForm.setValue({
      drawingName: this.name,
      drawingVisibility: this.visibility,
      drawingPassword: this.password,
      canvWidth: this.canvasBuilder.getDefWidth(),
      canvHeight: this.canvasBuilder.getDefHeight(),
      canvColor: this.canvasBuilder.getDefColor(),
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

  async onSubmit() {
    // TODO: To change while integrating with socket
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
      ownerId: UserToken.userToken,
    };

    try {
      if (
        this.visibility === DrawingVisibilityLevel.PROTECTED &&
        VALUES.drawingPassword === null
      ) {
        throw new Error('Un mot de passe est requis');
      }
      this.drawingService.createDrawing(this.newDrawing).then((drawingIdServer: number)=>{
        console.log(drawingIdServer);
        let joinDrawing: JoinDrawing = {drawingId: drawingIdServer, userId: UserToken.userToken, password: this.password}
        this.socketService.sendJoinDrawingRequest(joinDrawing);
        this.closeModalForm();
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
    this.windowService.closeWindow();
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
}
