/* eslint-disable no-console */
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Drawing } from '@models/DrawingMeta';
import {
  drawingVisibilityItems,
  VisibilityItem,
  VisibilityLevel,
} from '@models/VisibilityMeta';
import { CanvasBuilderService } from '@services/canvas-builder/canvas-builder.service';
import { DrawingSocketService } from '@services/drawing-socket/drawing-socket.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

@Component({
  selector: 'app-new-drawing',
  templateUrl: './new-drawing.component.html',
  styleUrls: ['./new-drawing.component.scss'],
})
export class NewDrawingComponent implements OnInit {
  newDrawingForm!: FormGroup;
  inputEntered: boolean = false;
  drawingVisibilityItems: VisibilityItem[];

  name: string = '';
  visibility: VisibilityLevel = 0;
  password?: string = '';
  width: number;
  height: number;
  bgColor: string;

  newDrawingToSendToDB: Drawing = {
    drawingId: undefined,
    name: '',
    visibility: VisibilityLevel.PUBLIC,
    password: undefined,
    width: 0,
    height: 0,
    bgColor: '',
    ownerId: undefined,
  };

  constructor(
    private canvasBuilder: CanvasBuilderService,
    private drawingSocketService: DrawingSocketService,
    private formBuilder: FormBuilder,
    private router: Router,
    private windowService: ModalWindowService
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
      drawingVisibility: ['', [Validators.required]],
      drawingPassword: ['', []],
      canvWidth: ['', [Validators.pattern(/^\d+$/), Validators.min(1)]], // accepts only positive integers
      canvHeight: ['', [Validators.pattern(/^\d+$/), Validators.min(1)]],
      canvColor: ['', Validators.pattern(/^[a-fA-F0-9]{6}$/)], // only accepts 6-chars strings made of hex characters
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
    if (this.visibility === VisibilityLevel.PROTECTED) {
      return true;
    }
    return false;
  }

  onSubmit() {
    // TODO: To change while integrating with socket
    const VALUES = this.newDrawingForm.value;
    this.newDrawingToSendToDB = VALUES;

    console.log(
      'TURBO 🚀 - file: new-drawing.component.ts - line 83 - NewDrawingComponent - VALUES',
      VALUES
    );
    console.log(
      'TURBO 🚀 - file: new-drawing.component.ts - line 125 - NewDrawingComponent - this.newDrawingToSendToDB',
      this.newDrawingToSendToDB
    );

    this.drawingSocketService.createDrawing(VALUES);

    this.canvasBuilder.setCanvasFromForm(
      +VALUES.canvWidth,
      +VALUES.canvHeight,
      VALUES.canvColor
    );

    this.canvasBuilder.emitCanvas();
    this.closeModalForm();
    this.router.navigate(['/draw']);
    const LOAD_TIME = 15;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, LOAD_TIME);
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
