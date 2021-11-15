/* eslint-disable no-restricted-syntax */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ChosenColors } from '@models/ChosenColors';
import { colorData } from '@components/color-picker/color-data';
import { ColorConvertingService } from './color-converting.service';
import { InteractionService } from '../interaction/interaction.service';

/* -----------------------------Color valur table-----------------------------------------*
 * RGBA min/max value : R [0,255] , G [0,255] , B [0,255] , A [0,1]                       *
 * HSL  min/max value : H [0,360] , S [0,1] , L [0,1]                                     *
 * HEX  min/max value : R [00,FF] , G [00,FF] , B [00,FF] , A [00,FF] ( i.e FF = 255 )    *
 * Display min/max value : RGB [0,255] , H [0,360] , ASL [0,100]% , HEX [00,FF]           *
 * Conversion methode for display : RBAH HEX  the same value, ASL * 100 for poucent value *
 * HEX color string 9 number total: #RRGGBBAA                                             *
 * # is not needed for math so it need to be cut from formula (i.e substring(1,X))        *
 * RR is red value.To get use substring(1,3) if # is present else substring(0,2)          *
 * GG is green value.To get use substring(3,5) if # is present else substring(2,4)        *
 * BB is blue value.To get use substring(5,7) if # is present else substring(4,6)         *
 * AA is opacity value.To get use substring(7,9) if # is present else substring(6,8)      *
 *---------------------------------------------------------------------------------------*/

@Injectable({
  providedIn: 'root',
})
export class ColorPickingService {
  private readonly hexLen: number = 9; // #ffffffff has 9 chars
  cData = colorData; // Interface for Color data
  colors!: ChosenColors;
  colorSubject: Subject<ChosenColors> = new Subject<ChosenColors>(); // le constuire à qqpart

  constructor(public colorConvert: ColorConvertingService, private interactionService: InteractionService) {}

  emitColors(): void {
    this.colorSubject.next(this.colors);
    this.interactionService.emitUpdateColorSignal();
  }

  /** ********************** SETTERS SECTION ************************** */
  setColorsFromForm(
    primary: string,
    secondary: string,
    background: string
  ): void {
    this.colors = {
      primColor: primary,
      secColor: secondary,
      backColor: background,
    };
  }

  setColor(color: number[]): string {
    const LIMIT = 3;
    if (color.length < LIMIT) {
      return '';
    }
    let newColor: string = `#${this.colorConvert.rgbToHex(
      color[0]
    )}${this.colorConvert.rgbToHex(color[1])}${this.colorConvert.rgbToHex(
      color[2]
    )}`;
    switch (this.cData.colorMode) {
      case this.cData.PRIMARY_COLOR_MODE:
        newColor += this.colorConvert.alphaRGBToHex(this.cData.primaryAlpha);
        this.cData.primaryColor = newColor;
        break;
      case this.cData.SECONDARY_COLOR_MODE:
        newColor += this.colorConvert.alphaRGBToHex(this.cData.secondaryAlpha);
        this.cData.secondaryColor = newColor;
        break;
      case this.cData.BACKGROUND_COLOR_MODE:
        newColor += this.colorConvert.alphaRGBToHex(
          this.cData.backgroundColorAlpha
        );
        this.cData.backgroundColor = newColor;
        break;
      default:
        break;
    }
    return newColor;
  }

  setColorMode(event: MouseEvent): void {
    if (this.cData.colorMode === this.cData.BACKGROUND_COLOR_MODE) {
      return;
    }
    switch (event.button) {
      case 0:
        this.cData.colorMode = this.cData.PRIMARY_COLOR_MODE;
        break;
      case 2:
        this.cData.colorMode = this.cData.SECONDARY_COLOR_MODE;
        break;
      default:
        break;
    }
  }

  // Set position of x and y of saturatio/lightness cursor
  setSLCursor(x: number, y: number): void {
    this.cData.slCursorX = x;
    this.cData.slCursorY = y;
  }

  setSaturation(s: number): void {
    switch (this.cData.colorMode) {
      case this.cData.PRIMARY_COLOR_MODE:
        this.cData.primarySaturation = s;
        break;
      case this.cData.SECONDARY_COLOR_MODE:
        this.cData.secondarySaturation = s;
        break;
      case this.cData.BACKGROUND_COLOR_MODE:
        this.cData.backgroundColorSaturation = s;
        break;
      default:
        break;
    }
  }

  getSaturation(): number {
    const RET = -1;
    switch (this.cData.colorMode) {
      case this.cData.PRIMARY_COLOR_MODE:
        return this.cData.primarySaturation;
      case this.cData.SECONDARY_COLOR_MODE:
        return this.cData.secondarySaturation;
      case this.cData.BACKGROUND_COLOR_MODE:
        return this.cData.backgroundColorSaturation;
      default:
        break;
    }
    return RET;
  }

  /** ********************** SELECTORS SECTION ************************** */
  hueSelector(event: MouseEvent): void {
    let hue = 0;
    if (this.cData.isHueSelecting) {
      hue = this.computeHue(event);
      this.cData.currentHue = Math.round(hue);
      const COLOR = this.setColor(
        this.colorConvert.hslToRgb(
          hue,
          this.cData.saturationSliderInput / this.cData.POURCENT_MODIFIER,
          this.cData.lightnessSliderInput / this.cData.POURCENT_MODIFIER
        )
      );
      this.updateDisplay(COLOR);
    }
  }

  // saturation/lightness selector
  slSelector(event: MouseEvent): void {
    if (!this.cData.isSLSelecting) {
      return;
    }
    const OFFSET = 25;
    const X: number = event.offsetX - OFFSET;
    const Y: number = event.offsetY - OFFSET;
    this.setSLCursor(X, Y);
    this.cData.saturationSliderInput = X * 2;
    this.cData.lightnessSliderInput = Y * 2;
    this.setSaturation(this.cData.saturationSliderInput);
    const HSL: number[] = [
      this.cData.currentHue,
      this.cData.saturationSliderInput / this.cData.POURCENT_MODIFIER,
      this.cData.lightnessSliderInput / this.cData.POURCENT_MODIFIER,
    ];
    const COLOR = this.setColor(
      this.colorConvert.hslToRgb(
        this.cData.currentHue,
        this.cData.saturationSliderInput / this.cData.POURCENT_MODIFIER,
        this.cData.lightnessSliderInput / this.cData.POURCENT_MODIFIER
      )
    );
    this.updateDisplay(COLOR, this.colorConvert.hexToRgba(COLOR), HSL);
  }

  lastColorSelector(event: MouseEvent, lastColor: string): void {
    this.setColorMode(event);
    const COLOR = this.setColor(this.colorConvert.hexToRgba(lastColor));
    this.updateDisplay(COLOR);
  }

  /** ********************** EVENTS SECTION ************************** */
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  onSwapSVGMouseOver(): void {
    if (this.cData.colorMode === this.cData.BACKGROUND_COLOR_MODE) {
      return;
    }
    this.cData.swapStrokeStyle = 'yellow';
  }

  onSwapSVGMouseLeave(): void {
    this.cData.swapStrokeStyle = 'white';
  }

  onSwapSVGMouseDown(): void {
    if (this.cData.colorMode === this.cData.BACKGROUND_COLOR_MODE) {
      return;
    }
    this.cData.swapStrokeStyle = 'lightblue';
  }

  onSwapSVGMouseUp(): void {
    this.cData.swapStrokeStyle = 'white';
  }

  onRadioButtonChange(newColorMode: string): void {
    this.cData.colorMode = newColorMode;
    this.swapInputDisplay();
  }

  // Mouse up event function when mouse on a color selector
  colorSelectOnMouseUp(): void {
    if (!this.cData.isSLSelecting && !this.cData.isHueSelecting) {
      return;
    }
    this.cData.rectOffsetFill = 'none';
    this.cData.isHueSelecting = false;
    this.cData.isSLSelecting = false;
    switch (this.cData.colorMode) {
      case this.cData.PRIMARY_COLOR_MODE:
        this.updateLastColor(this.cData.primaryColor);
        break;
      case this.cData.SECONDARY_COLOR_MODE:
        this.updateLastColor(this.cData.secondaryColor);
        break;
      case this.cData.BACKGROUND_COLOR_MODE:
        this.updateLastColor(this.cData.backgroundColor);
        break;
      default:
        break;
    }
    this.setColorsFromForm(
      this.cData.primaryColor,
      this.cData.secondaryColor,
      this.cData.backgroundColor
    );
    this.emitColors();
  }

  // Mouse down event function when mouse on hue selector
  hueSelectorOnMouseDown(event: MouseEvent): void {
    if (this.cData.isSLSelecting) {
      return;
    }
    this.cData.isHueSelecting = true;
    this.cData.rectOffsetFill = 'white';
    this.setColorMode(event);
    this.hueSelector(event);
  }

  selectorOnMouseLeave(event: MouseEvent): void {
    if (!this.cData.isHueSelecting) {
      return;
    }
    this.hueSelector(event);
  }

  // Mouse down event function when mouse on saturation/lightness selector
  slSelectorOnMouseDown(event: MouseEvent): void {
    if (this.cData.isHueSelecting) {
      return;
    }
    this.cData.isSLSelecting = true;
    this.setColorMode(event);
    this.slSelector(event);
  }

  // DISPLAY/UPDATE
  // Update last color table with a new color
  updateLastColor(newColor: string): void {
    const HEX_SUBSTR = 7; // #ffffff as 7 chars - 1 for # and 6 for hex values
    for (const COLOR of this.cData.lastColorRects) {
      if (COLOR.fill === newColor.substring(0, HEX_SUBSTR)) {
        return;
      }
    }
    for (const COLOR of this.cData.lastColorRects) {
      if (COLOR.fill === 'none') {
        COLOR.fill = newColor.substring(0, HEX_SUBSTR);
        COLOR.stroke = 'white';
        return;
      }
    }
    for (let i = 0; i < this.cData.lastColorRects.length - 1; i++) {
      this.cData.lastColorRects[i].fill = this.cData.lastColorRects[i + 1].fill;
    }
    this.cData.lastColorRects[this.cData.lastColorRects.length - 1].fill =
      newColor.substring(0, HEX_SUBSTR);
  }

  updateDisplay(
    hex: string,
    rgb: number[] = this.colorConvert.hexToRgba(hex.substring(1, this.hexLen)),
    hsl: number[] = this.colorConvert.rgbToHsl(rgb[0], rgb[1], rgb[2])
  ): void {
    // RGBA value of last color for display
    this.updateDisplayRGB(rgb);
    // HSL value of last color for display
    this.updateDisplayHSL(hsl);
    this.updateDisplayHex(hex);
    this.setColorsFromForm(
      this.cData.primaryColor,
      this.cData.secondaryColor,
      this.cData.backgroundColor
    );
    this.emitColors();
  }

  updateDisplayRGB(rgb: number[]): void {
    const POS = 3;
    this.cData.opacitySliderInput = Math.round(
      rgb[POS] * this.cData.POURCENT_MODIFIER
    );
  }

  updateDisplayHSL(hsl: number[]): void {
    const NEW_SATURATION: number = Math.round(
      hsl[1] * this.cData.POURCENT_MODIFIER
    );
    this.cData.lightnessSliderInput = Math.round(
      hsl[2] * this.cData.POURCENT_MODIFIER
    );
    const LIGHTNESS_MIN_MAX =
      this.cData.lightnessSliderInput === this.cData.MIN_LIGHTNESS_VALUE ||
      this.cData.lightnessSliderInput ===
        this.cData.MAX_LIGHTNESS_VALUE * this.cData.POURCENT_MODIFIER;
    if (!LIGHTNESS_MIN_MAX) {
      this.cData.saturationSliderInput = NEW_SATURATION;
    } else {
      this.cData.saturationSliderInput = this.getSaturation();
    }
    this.setSLCursor(
      this.cData.saturationSliderInput / 2,
      this.cData.lightnessSliderInput / 2
    );
  }

  updateDisplayHex(hex: string): void {
    const BIG_SUB = 7;
    const AVERAGE_SUB = 5;
    const SMALL_SUB = 3;
    this.cData.hexColorInput = hex.substring(1, BIG_SUB); // only 1 to 7 char are needed for view
    this.cData.redHexInput = hex.substring(1, SMALL_SUB);
    this.cData.greenHexInput = hex.substring(SMALL_SUB, AVERAGE_SUB);
    this.cData.blueHexInput = hex.substring(AVERAGE_SUB, BIG_SUB);
  }

  // Change color display between primary , secondary and background
  swapInputDisplay(): void {
    const COLOR = this.selectDisplayColor();
    this.updateDisplay(COLOR);
  }

  // udapte display with current value
  selectDisplayColor(): string {
    let color = '';
    switch (this.cData.colorMode) {
      case this.cData.PRIMARY_COLOR_MODE:
        color = this.cData.primaryColor;
        break;
      case this.cData.SECONDARY_COLOR_MODE:
        color = this.cData.secondaryColor;
        break;
      case this.cData.BACKGROUND_COLOR_MODE:
        color = this.cData.backgroundColor;
        break;
      default:
        break;
    }
    return color;
  }

  // Exchange primary and secondary value
  swapPrimarySecondary(): void {
    if (this.cData.colorMode === this.cData.BACKGROUND_COLOR_MODE) {
      return;
    }
    const TEMP_COLOR: string = this.cData.primaryColor;
    const TEMP_ALPHA: number = this.cData.primaryAlpha;

    this.cData.primaryColor = this.cData.secondaryColor;
    this.cData.primaryAlpha = this.cData.secondaryAlpha;

    this.cData.secondaryColor = TEMP_COLOR;
    this.cData.secondaryAlpha = TEMP_ALPHA;
    const COLOR = this.selectDisplayColor();
    this.updateDisplay(COLOR);
  }

  // INPUTS
  // validate if char is hexadecimal.
  validateHexInput(event: KeyboardEvent, hexLength: number, hex: string): void {
    event.stopPropagation();
    this.cData.isValideInput = false;
    // left/right arrow/delete
    const LEFT_ARROW = 37;
    const RIGHT_ARROW = 39;
    const DEL = 46;
    // tslint:disable-next-line: deprecation // tslint:disable-next-line: prefer-switch
    if (
      event.which === LEFT_ARROW ||
      event.which === RIGHT_ARROW ||
      event.which === DEL
    ) {
      return;
    }
    // if not backspace
    const BACKSPACE = 8;
    // tslint:disable-next-line: deprecation
    if (event.which !== BACKSPACE) {
      if (hex.length === hexLength) {
        event.preventDefault();
        return;
      }
    }
    // tslint:disable-next-line: deprecation
    const VALIDATOR = this.colorConvert.validateHex(event.which);
    if (!VALIDATOR) {
      event.preventDefault();
      return;
    }
    this.cData.isValideInput = true;
  }

  /**
   * Red hex text field input event function
   * Update display if valide value are input
   */
  onHexInput(hexLength: number, hex: string, hexInputField: string): void {
    if (hex.length === hexLength && this.cData.isValideInput) {
      const NEW_COLOR: string = this.writeHexColor(hexInputField);
      this.updateDisplay(NEW_COLOR);
      this.updateLastColor(NEW_COLOR);
      this.cData.isValideInput = false;
    }
  }

  writeHexColor(color: string): string {
    let ret = '';
    const BIG_SUB = 6;
    const SMALL_SUB = 4;
    switch (color) {
      case this.cData.RED_INPUT_FIELD:
        ret += `#${this.cData.redHexInput}${this.cData.hexColorInput.substring(
          2,
          BIG_SUB
        )}`;
        break;
      case this.cData.GREEN_INPUT_FIELD:
        ret += `#${this.cData.hexColorInput.substring(0, 2)}${
          this.cData.greenHexInput
        }${this.cData.hexColorInput.substring(SMALL_SUB, BIG_SUB)}`;
        break;
      case this.cData.BLUE_INPUT_FIELD:
        ret += `#${this.cData.hexColorInput.substring(0, SMALL_SUB)}${
          this.cData.blueHexInput
        }`;
        break;
      case this.cData.COLOR_HEX_INPUT_FIELD:
        ret += `#${this.cData.hexColorInput}`;
        break;
      default:
        break;
    }
    switch (this.cData.colorMode) {
      case this.cData.PRIMARY_COLOR_MODE:
        ret += this.colorConvert.alphaRGBToHex(this.cData.primaryAlpha);
        this.cData.primaryColor = ret;
        break;
      case this.cData.SECONDARY_COLOR_MODE:
        ret += this.colorConvert.alphaRGBToHex(this.cData.secondaryAlpha);
        this.cData.secondaryColor = ret;
        break;
      case this.cData.BACKGROUND_COLOR_MODE:
        ret += this.colorConvert.alphaRGBToHex(this.cData.backgroundColorAlpha);
        this.cData.backgroundColor = ret;
        break;
      default:
        break;
    }
    return ret;
  }

  // Saturation and lightness slider input event function
  onSLSliderInput(): void {
    // hsl saturation and ligthness value are between [0;1] while display is [0;100]%.So we need to divide by 100
    const RGB = this.colorConvert.hslToRgb(
      this.cData.currentHue,
      this.cData.saturationSliderInput / this.cData.POURCENT_MODIFIER,
      this.cData.lightnessSliderInput / this.cData.POURCENT_MODIFIER
    );
    const NEW_COLOR = this.setColor(RGB);
    this.setSaturation(this.cData.saturationSliderInput);
    this.updateDisplay(NEW_COLOR);
    this.updateLastColor(NEW_COLOR);
  }

  sliderAlphaChange(): void {
    const SUB = 7;
    switch (this.cData.colorMode) {
      case this.cData.PRIMARY_COLOR_MODE:
        this.cData.primaryAlpha =
          this.cData.opacitySliderInput / this.cData.POURCENT_MODIFIER;
        this.cData.primaryColor =
          this.cData.primaryColor.substring(0, SUB) +
          this.colorConvert.alphaRGBToHex(this.cData.primaryAlpha);
        break;
      case this.cData.SECONDARY_COLOR_MODE:
        this.cData.secondaryAlpha =
          this.cData.opacitySliderInput / this.cData.POURCENT_MODIFIER;
        this.cData.secondaryColor =
          this.cData.secondaryColor.substring(0, SUB) +
          this.colorConvert.alphaRGBToHex(this.cData.secondaryAlpha);
        break;
      case this.cData.BACKGROUND_COLOR_MODE:
        this.cData.backgroundColorAlpha =
          this.cData.opacitySliderInput / this.cData.POURCENT_MODIFIER;
        this.cData.backgroundColor = `#${
          this.cData.hexColorInput
        }${this.colorConvert.alphaRGBToHex(this.cData.backgroundColorAlpha)}`;
        break;
      default:
        break;
    }
    this.setColorsFromForm(
      this.cData.primaryColor,
      this.cData.secondaryColor,
      this.cData.backgroundColor
    );
    this.emitColors();
  }

  /** ********************** MATH SECTION ************************** */
  computeHue(event: MouseEvent): number {
    // Hue circle radius is 45px and stroke widht 10px which mean average radius is ( 55 - 45 ) / 2 = 50
    // Which is subtract from offset to center circle for math formula
    const MAX_RADIUS = 360;
    const DIV = 180;
    const REDUCE = 50;
    const RADIUS_X: number = event.offsetX - REDUCE;
    const RADIUS_Y: number = event.offsetY - REDUCE;
    const RADIUS: number = Math.sqrt(RADIUS_X ** 2 + RADIUS_Y ** 2);
    const THETA: number = Math.acos(RADIUS_X / RADIUS);
    let hue = 0;
    // hue is a value of 0 to 360 degree but theta is in radiant so conversion are needed depending on raduisY signe
    if (RADIUS_Y >= 0) {
      hue = (DIV / Math.PI) * THETA;
    } else {
      hue = MAX_RADIUS - (DIV / Math.PI) * THETA;
    }
    return hue;
  }
}
