import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { CanvasBuilderService } from '@services/canvas-builder/canvas-builder.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

@Component({
  selector: 'app-new-drawing',
  templateUrl: './new-drawing.component.html',
  styleUrls: ['./new-drawing.component.scss'],
})
export class NewDrawingComponent implements OnInit {
  newDrawingForm!: FormGroup;
  name: string = '';
  width: number;
  height: number;
  color: string;
  inputEntered: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private canvasBuilder: CanvasBuilderService,
    private winService: ModalWindowService,
    private router: Router
  ) {
    this.initForm();
    this.width = this.canvasBuilder.getDefWidth();
    this.height = this.canvasBuilder.getDefHeight();
    this.color = this.canvasBuilder.getDefColor();
  }

  ngOnInit(): void {
    this.initForm();
    this.resizeCanvas();
    this.color = this.canvasBuilder.getDefColor();
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
      canvWidth: ['', [Validators.pattern(/^\d+$/), Validators.min(1)]], // accepts only positive integers
      canvHeight: ['', [Validators.pattern(/^\d+$/), Validators.min(1)]],
      canvColor: ['', Validators.pattern(/^[a-fA-F0-9]{6}$/)], // only accepts 6-chars strings made of hex characters
    });
    this.newDrawingForm.setValue({
      drawingName: this.name,
      canvWidth: this.canvasBuilder.getDefWidth(),
      canvHeight: this.canvasBuilder.getDefHeight(),
      canvColor: this.canvasBuilder.getDefColor(),
    });
  }

  onSubmit() {
    // TODO: To change while integrating with socket
    const VALUES = this.newDrawingForm.value;
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
    this.winService.closeWindow();
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
    this.color = color;
    this.newDrawingForm.patchValue({ canvColor: this.color }); // updates value for form
  }

  onInput(): void {
    if (this.canvColor && this.canvColor.valid) {
      this.color = this.canvColor.value;
    }
  }
}
