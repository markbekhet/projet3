import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalWindowService } from 'src/app/services/window-handler/modal-window.service';
import { CanvasBuilderService } from 'src/app/services/canvas-builder/canvas-builder.service';

@Component({
  selector: 'app-new-draw',
  templateUrl: './new-draw.component.html',
  styleUrls: ['./new-draw.component.scss']
})
export class NewDrawComponent implements OnInit {

  newDrawForm!: FormGroup;
  width: number;
  height: number;
  color: string;
  inputEntered: boolean= false;
  constructor(
    private formBuilder: FormBuilder,
    private canvasBuilder: CanvasBuilderService,
    private winService: ModalWindowService,
    )
    { 
      this.initForm();
      this.width = this.canvasBuilder.getDefWidth();
      this.height = this.canvasBuilder.getDefHeight();
      this.color= this.canvasBuilder.getDefColor(); 
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

  blockEvent(e: KeyboardEvent){
    e.stopPropagation();
    this.inputEntered = false;
  }
  
  resizeCanvas(){
    this.width = this.canvasBuilder.getDefWidth();
    this.height = this.canvasBuilder.getDefHeight();
  }

  initForm(){
    this.newDrawForm = this.formBuilder.group({
      canvWidth: ['', [Validators.pattern(/^\d+$/), Validators.min(1)]], // accepts only positive integers
      canvHeight: ['', [Validators.pattern(/^\d+$/), Validators.min(1)]],
      canvColor: ['', Validators.pattern(/^[a-fA-F0-9]{6}$/)], // only accepts 6-chars strings made of hex characters
    });
    this.newDrawForm.setValue({
      canvWidth: this.canvasBuilder.getDefWidth(),
      canvHeight: this.canvasBuilder.getDefHeight(),
      canvColor: this.canvasBuilder.getDefColor()
    });
  }

  onSubmit(){
    // TODO: To implement
  }

  closeModalForm(): void {
    this.winService.closeWindow();
  }

  get canvHeight(): AbstractControl | null { // basic accessors to get individual input validity in html
    return this.newDrawForm.get('canvHeight');
  }

  get canvWidth(): AbstractControl | null {
    return this.newDrawForm.get('canvWidth');
  }

  get canvColor(): AbstractControl | null {
    return this.newDrawForm.get('canvColor');
  }

  updateColor(color: string): void {
    this.color = color;
    this.newDrawForm.patchValue({ canvColor: this.color }); // updates value for form
  }

  onInput(): void {

    if (this.canvColor && this.canvColor.valid) {
      this.color = this.canvColor.value;
    }
  }
}
