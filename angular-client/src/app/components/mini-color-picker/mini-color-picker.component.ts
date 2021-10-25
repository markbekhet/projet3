import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ColorConvertingService } from 'src/app/services/colorPicker/color-converting.service';
import { colorData } from './color-data';

const OFFSET_Y = 10;
const OFFSET_X = 25;
const SV_MAX_VALUE = 100;
const HUE_CURSOR_WIDTH = 6;
const VALUE = 100;

@Component({
  selector: 'app-mini-color-picker',
  templateUrl: './mini-color-picker.component.html',
  styleUrls: ['./mini-color-picker.component.scss']
})
export class MiniColorPickerComponent implements OnInit {

  @Output() colorToEmit: EventEmitter<string> = new EventEmitter();
  @Input() color: string;

  cData = colorData;
  offsetY: number;
  offsetX: number;
  svMaxValue: number;
  hueCursorWidth: number;
  hue: number;
  saturation: number;
  value: number;
  isHueSelecting: boolean;
  isSVSelecting: boolean;
  svCursorPos: {};
  constructor(public colorConvert: ColorConvertingService) { 
    this.offsetY = OFFSET_Y;
      this.offsetX = OFFSET_X;
      this.svMaxValue = SV_MAX_VALUE;
      this.hueCursorWidth = HUE_CURSOR_WIDTH;
      this.color = 'ffffff';
      this.hue = 0;
      this.saturation = 0;
      this.value = VALUE;
      this.svCursorPos = { x: this.saturation, y: this.svMaxValue - this.value };
      this.isHueSelecting = false;
      this.isSVSelecting = false;
  }

  ngOnInit(): void {
    this.emitColor();
  }

  emitColor(): void {
      this.colorToEmit.emit(this.color);
  }

  setColor(): void {
      // Slice(1) removes the #
      this.color = this.colorConvert.hsvToHex(this.hue, this.saturation / this.svMaxValue, this.value / this.svMaxValue).slice(1);
      this.emitColor();
  }

  onMouseDownHue(event: MouseEvent): void {
      this.isHueSelecting = true;
      this.hueSelect(event);
  }

  onMouseDownSV(event: MouseEvent): void {
      this.isSVSelecting = true;
      this.svSelect(event);
  }

  onMouseUp(): void {
      this.isHueSelecting = false;
      this.isSVSelecting = false;
  }

  hueSelect(event: MouseEvent): void {
      if (!this.isHueSelecting) {
          return;
      }
      this.hue = Math.round((event.offsetY - this.offsetY) * (this.cData.MAX_HUE_VALUE / this.svMaxValue));
      this.setColor();
  }

  svSelect(event: MouseEvent): void {
      if (!this.isSVSelecting) {
          return;
      }
      this.saturation = event.offsetX - this.offsetX;
      this.value = this.svMaxValue - (event.offsetY - this.offsetY);
      this.setColor();
  }

  get hueCursorStyles(): {} {
      return {
          transform: 'translateY(' +
              ((Math.round(this.hue * (this.svMaxValue / this.cData.MAX_HUE_VALUE))) + (this.offsetY - this.hueCursorWidth / 2)) + 'px)'
      };
  }

  get svCursorStyles(): {} {
      return { transform: 'translate(' + this.saturation + 'px,' + (this.svMaxValue - this.value) + 'px)' };
  }

}
