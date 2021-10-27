import { Injectable } from '@angular/core';
import { colorData } from '../../components/color-picker/color-data';

@Injectable({
    providedIn: 'root',
})
export class ColorConvertingService {
    // cData = colorData; // Interface for Color data
    // RGB [0,255]
    validateRGB(r: number): boolean {
        return r >= colorData.MIN_RGB_VALUE && r <= colorData.MAX_RGB_VALUE;
    }
    rgbToHex(r: number = colorData.MIN_RGB_VALUE): string {
        let hex = '';
        const bits: number[] = [];
        if (!this.validateRGB(r)) {
            return '';
        }
        const SHIFTER = 4;
        const HEX_N = 0xf;
        // Split 1 8 bits int into 2 4 bits int
        // tslint:disable-next-line: no-bitwise
        bits[0] = r >> SHIFTER;
        // tslint:disable-next-line: no-bitwise
        bits[1] = r & HEX_N;

        for (let i = 0; i < 2; i++) {
            if (bits[i] >= colorData.HEX_NUMBER_LETTER_MIN_VALUE) {
                hex += String.fromCharCode(bits[i] + colorData.ASCII_A - colorData.HEX_NUMBER_LETTER_MIN_VALUE);
            } else {
                hex += '' + bits[i];
            }
        }
        return hex;
    }
    alphaRGBToHex(a: number): string {
        const ALPHA: number = a * colorData.RGBA_TO_HEX_ALPHA_MODIFIER;
        if (!this.validateRGB(ALPHA)) {
            return '';
        }
        return this.rgbToHex(ALPHA);
    }
    validateHSL(h: number, s: number, l: number): boolean {
        const H_OK = h >= colorData.MIN_HUE_VALUE && h <= colorData.MAX_HUE_VALUE;
        const S_OK = s >= colorData.MIN_SATURATION_VALUE && s <= colorData.MAX_SATURATION_VALUE;
        const L_OK = l >= colorData.MIN_LIGHTNESS_VALUE && l <= colorData.MAX_LIGHTNESS_VALUE;
        return H_OK && S_OK && L_OK;
    }
    hslToRgb(
        H: number = colorData.MIN_HUE_VALUE,
        S: number = colorData.MAX_SATURATION_VALUE,
        L: number = colorData.MAX_LIGHTNESS_VALUE / 2,
    ): number[] {
        const INIT_NUM = -1;
        const RGB: number[] = [INIT_NUM, INIT_NUM, INIT_NUM];
        if (!this.validateHSL(H, S, L)) {
            return RGB;
        }
        const C: number = (1 - Math.abs(2 * L - 1)) * S;
        const div = 60;
        const X: number = C * (1 - Math.abs(((H / div) % 2) - 1));
        const M: number = L - C / 2;

        let R: number = colorData.MIN_RGB_VALUE;
        let G: number = colorData.MIN_RGB_VALUE;
        let B: number = colorData.MIN_RGB_VALUE;
        const BIG_DIV = 6;
        const SMALL_DIV = 3;
        const MULT = 5;
        // Math formula for conversion
        if (colorData.MIN_HUE_VALUE <= H && H < colorData.MAX_HUE_VALUE / BIG_DIV) {
            R = C;
            G = X;
            B = colorData.MIN_RGB_VALUE;
        } else if (colorData.MAX_HUE_VALUE / BIG_DIV <= H && H < colorData.MAX_HUE_VALUE / SMALL_DIV) {
            R = X;
            G = C;
            B = colorData.MIN_RGB_VALUE;
        } else if (colorData.MAX_HUE_VALUE / SMALL_DIV <= H && H < colorData.MAX_HUE_VALUE / 2) {
            R = colorData.MIN_RGB_VALUE;
            G = C;
            B = X;
        } else if (colorData.MAX_HUE_VALUE / 2 <= H && H < (2 * colorData.MAX_HUE_VALUE) / SMALL_DIV) {
            R = colorData.MIN_RGB_VALUE;
            G = X;
            B = C;
        } else if ((2 * colorData.MAX_HUE_VALUE) / SMALL_DIV <= H && H < (MULT * colorData.MAX_HUE_VALUE) / BIG_DIV) {
            R = X;
            G = colorData.MIN_RGB_VALUE;
            B = C;
        } else if ((MULT * colorData.MAX_HUE_VALUE) / BIG_DIV <= H && H < colorData.MAX_HUE_VALUE) {
            R = C;
            G = colorData.MIN_RGB_VALUE;
            B = X;
        }
        RGB[0] = Math.round((R + M) * colorData.MAX_RGB_VALUE);
        RGB[1] = Math.round((G + M) * colorData.MAX_RGB_VALUE);
        RGB[2] = Math.round((B + M) * colorData.MAX_RGB_VALUE);

        return RGB;
    }

    rgbToHsl(r: number, g: number, b: number): number[] {
        // DONE
        // scale dowon rgb value to a range of [ 0 , 1 ] from [ 0 , 255 ]
        const PRIME_R: number = r / colorData.MAX_RGB_VALUE;
        const PRIME_G: number = g / colorData.MAX_RGB_VALUE;
        const PRIME_B: number = b / colorData.MAX_RGB_VALUE;

        // getting min/max and delta value of primes
        const MAX: number = Math.max(PRIME_R, PRIME_G, PRIME_B);
        const MIN: number = Math.min(PRIME_R, PRIME_G, PRIME_B);
        const DELTA: number = MAX - MIN;

        let hue: number = colorData.MIN_HUE_VALUE;
        let saturation: number = colorData.MIN_SATURATION_VALUE;
        let lightness: number = colorData.MIN_LIGHTNESS_VALUE;
        // math conversion formula base on max prime
        const NUM = 6;
        const ADD = 4;
        if (DELTA) {
            switch (MAX) {
                case PRIME_R: hue = (colorData.MAX_HUE_VALUE / NUM) * (((PRIME_G - PRIME_B) / DELTA) % NUM);
                              break;
                case PRIME_G: hue = (colorData.MAX_HUE_VALUE / NUM) * ((PRIME_B - PRIME_R) / DELTA + 2);
                              break;
                case PRIME_B: hue = (colorData.MAX_HUE_VALUE / NUM) * ((PRIME_R - PRIME_G) / DELTA + ADD);
                              break;
            }
        }

        // make sure hue is in [ 0 , 360 ] degree
        if (hue < colorData.MIN_HUE_VALUE) {
            hue = colorData.MAX_HUE_VALUE + hue;
        }

        lightness = (MAX + MIN) / 2;

        if (DELTA) {
            saturation = DELTA / (1 - Math.abs(2 * lightness - 1));
        }

        const hsl: number[] = [];
        hsl[0] = hue;
        hsl[1] = saturation;
        hsl[2] = lightness;

        return hsl;
    }
    validateHex(hex: number): boolean {
        let hexOk = false;
        colorData.hexNumber.forEach((hexNumber) => {
            if (hex === hexNumber) {
                hexOk = true;
            }
        });
        return hexOk;
    }
    hexToRgba(hex: string): number[] {
        let colorBits: string = hex;
        // check if first char is a # (ascii code number is 35) and remove it
        const ASCII_HASH_TAG = 35;
        const INIT_VALUE = -1;
        const RGBA: number[] = [INIT_VALUE, INIT_VALUE, INIT_VALUE, INIT_VALUE];
        if (hex.charCodeAt(0) === ASCII_HASH_TAG) {
            colorBits = hex.substring(1, hex.length);
        }
        // return -1 if length is to big
        if (colorBits.length > colorData.HEX_NUMBER_MAX_LENGTH) {
            return RGBA;
        }
        // if string is impair return -1 to all value
        if (colorBits.length % 2) {
            return RGBA;
        }

        const BUFFER: number[] = [];
        for (let i = 0; i < colorBits.length; i++) {
            // Return -1 on rbga if char is invalide
            if (colorBits.charCodeAt(i) >= colorData.ASCII_a) {
                BUFFER[i] = colorBits.charCodeAt(i) - (colorData.ASCII_a - colorData.ASCII_A);
            } else {
                BUFFER[i] = colorBits.charCodeAt(i);
            }
            if (!this.validateHex(BUFFER[i])) {
                return RGBA;
            }
            // hex letter start at 10
            if (BUFFER[i] >= colorData.ASCII_A) {
                BUFFER[i] -= colorData.ASCII_A - colorData.HEX_NUMBER_LETTER_MIN_VALUE;
            } else {
                BUFFER[i] -= colorData.ASCII_0;
            }
        }
        const SHIFTER = 4;
        for (let j = 0; j < BUFFER.length / 2; j++) {
            // tslint:disable-next-line: no-bitwise
            RGBA[j] = (BUFFER[j * 2] << SHIFTER) | BUFFER[j * 2 + 1];
        }
        // lenght without # and alpha
        const NUM = 3;
        const REDUCE_HIGH = 7;
        const REDUCE_LOW = 5;
        if (colorBits.length <= colorData.HEX_NUMBER_MAX_LENGTH - NUM) {
            RGBA[NUM] = INIT_VALUE;
        } else {
            // opacity for rgba is between [0,1] while for hex it's [0,255]
            RGBA[NUM] = RGBA[NUM] / colorData.RGBA_TO_HEX_ALPHA_MODIFIER;
        }
        // length with only 2 colors
        if (colorBits.length <= colorData.HEX_NUMBER_MAX_LENGTH - REDUCE_LOW) {
            RGBA[2] = INIT_VALUE;
        }
        // lenght with only 1 color
        if (colorBits.length <= colorData.HEX_NUMBER_MAX_LENGTH - REDUCE_HIGH) {
            RGBA[1] = INIT_VALUE;
        }
        return RGBA;
    }

    hsvToHex(H: number, S: number, V: number): string {
        let hex = '';
        // tslint:disable-next-line: no-magic-numbers
        const RGB: number[] = [-1, -1, -1]; // array of bad index

        const BIG_DIV = 6;
        const C: number = S * V;
        const X: number = C * (1 - Math.abs(((H / (colorData.MAX_HUE_VALUE / BIG_DIV)) % 2) - 1));
        const M: number = V - C;

        let R: number = colorData.MIN_RGB_VALUE;
        let G: number = colorData.MIN_RGB_VALUE;
        let B: number = colorData.MIN_RGB_VALUE;

        // Math formula for conversion
        const SMALL_DIV = 3;
        const MULT = 5;
        if (colorData.MIN_HUE_VALUE <= H && H < colorData.MAX_HUE_VALUE / BIG_DIV) {
            R = C;
            G = X;
            B = colorData.MIN_RGB_VALUE;
        } else if (colorData.MAX_HUE_VALUE / BIG_DIV <= H && H < colorData.MAX_HUE_VALUE / SMALL_DIV) {
            R = X;
            G = C;
            B = colorData.MIN_RGB_VALUE;
        } else if (colorData.MAX_HUE_VALUE / SMALL_DIV <= H && H < colorData.MAX_HUE_VALUE / 2) {
            R = colorData.MIN_RGB_VALUE;
            G = C;
            B = X;
        } else if (colorData.MAX_HUE_VALUE / 2 <= H && H < (2 * colorData.MAX_HUE_VALUE) / SMALL_DIV) {
            R = colorData.MIN_RGB_VALUE;
            G = X;
            B = C;
        } else if ((2 * colorData.MAX_HUE_VALUE) / SMALL_DIV <= H && H < (MULT * colorData.MAX_HUE_VALUE) / BIG_DIV) {
            R = X;
            G = colorData.MIN_RGB_VALUE;
            B = C;
        } else if ((MULT * colorData.MAX_HUE_VALUE) / BIG_DIV <= H && H < colorData.MAX_HUE_VALUE) {
            R = C;
            G = colorData.MIN_RGB_VALUE;
            B = X;
        }
        RGB[0] = Math.round((R + M) * colorData.MAX_RGB_VALUE);
        RGB[1] = Math.round((G + M) * colorData.MAX_RGB_VALUE);
        RGB[2] = Math.round((B + M) * colorData.MAX_RGB_VALUE);

        hex = '#' + this.rgbToHex(RGB[0]) + this.rgbToHex(RGB[1]) + this.rgbToHex(RGB[2]);
        return hex;
    }
}
