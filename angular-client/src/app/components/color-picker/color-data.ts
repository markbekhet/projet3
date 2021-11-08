const HEX_ZERO = 48;
const HEX_ONE = 49;
const HEX_TWO = 50;
const HEX_THREE = 51;
const HEX_FOUR = 52;
const HEX_FIVE = 53;
const HEX_SIX = 54;
const HEX_SEVEN = 55;
const HEX_EIGHT = 56;
const HEX_NINE = 57;
const HEX_A = 65;
const HEX_B = 66;
const HEX_C = 67;
const HEX_D = 68;
const HEX_E = 69;
const HEX_F = 70;
const HEX_BACKSPACE = 8;
export const colorData = {
  currentHue: 0,
  primaryColor: '#000000FF',
  primaryAlpha: 1,
  primarySaturation: 0,
  primaryLightness: 0,
  secondaryColor: '#FF0000FF',
  secondaryAlpha: 1,
  secondarySaturation: 0,
  secondaryLightness: 0,
  backgroundColor: '#FFFFFFFF',
  backgroundColorAlpha: 1,
  backgroundColorSaturation: 0,
  backgroundColorLightness: 0,
  colorMode: 'Primary',
  PRIMARY_COLOR_MODE: 'Primary',
  SECONDARY_COLOR_MODE: 'Secondary',
  BACKGROUND_COLOR_MODE: 'Background',

  // input style
  hexColorInput: 'FF0000',
  redHexInput: 'FF',
  greenHexInput: '00',
  blueHexInput: '00',
  saturationSliderInput: 0,
  lightnessSliderInput: 0,
  opacitySliderInput: 100,

  slCursorX: 0,
  slCursorY: 0,
  isColorSelecting: false,
  isHueSelecting: false,
  isSLSelecting: false,
  isValideInput: false,
  rectOffsetFill: 'none',
  swapStrokeStyle: 'white',

  hexNumber: [
    HEX_ZERO,
    HEX_ONE,
    HEX_TWO,
    HEX_THREE,
    HEX_FOUR,
    HEX_FIVE,
    HEX_SIX,
    HEX_SEVEN,
    HEX_EIGHT,
    HEX_NINE,
    HEX_A,
    HEX_B,
    HEX_C,
    HEX_D,
    HEX_E,
    HEX_F,
    HEX_BACKSPACE,
  ],
  lastColorRects: [
    { x: 110, y: 25, fill: 'none', stroke: 'none' },
    { x: 130, y: 25, fill: 'none', stroke: 'none' },
    { x: 150, y: 25, fill: 'none', stroke: 'none' },
    { x: 170, y: 25, fill: 'none', stroke: 'none' },
    { x: 190, y: 25, fill: 'none', stroke: 'none' },
    { x: 110, y: 50, fill: 'none', stroke: 'none' },
    { x: 130, y: 50, fill: 'none', stroke: 'none' },
    { x: 150, y: 50, fill: 'none', stroke: 'none' },
    { x: 170, y: 50, fill: 'none', stroke: 'none' },
    { x: 190, y: 50, fill: 'none', stroke: 'none' },
  ],
  MAX_RGB_VALUE: 255,
  MIN_RGB_VALUE: 0,
  MIN_HUE_VALUE: 0,
  MAX_HUE_VALUE: 360,
  POURCENT_MODIFIER: 100,
  MIN_SATURATION_VALUE: 0,
  MAX_SATURATION_VALUE: 1,
  MIN_LIGHTNESS_VALUE: 0,
  MAX_LIGHTNESS_VALUE: 1,
  RGBA_TO_HEX_ALPHA_MODIFIER: 255,
  HEX_NUMBER_LETTER_MIN_VALUE: 10,
  ASCII_A: 65,
  ASCII_a: 97,
  ASCII_0: 48,
  HEX_NUMBER_MAX_LENGTH: 9,
  HEX_COLOR_INPUT_MAX_LENGTH: 6,
  HEX_RGB_INPUT_MAX_LENGTH: 2,
  COLOR_HEX_INPUT_FIELD: 'Hex',
  RED_INPUT_FIELD: 'Red',
  GREEN_INPUT_FIELD: 'Green',
  BLUE_INPUT_FIELD: 'Blue',
};
