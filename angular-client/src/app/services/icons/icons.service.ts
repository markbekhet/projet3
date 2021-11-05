import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconsService {

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) { 
    iconRegistry.addSvgIcon('pencil', sanitizer.bypassSecurityTrustResourceUrl('../../../assets/Tools-images/pencil.svg'));
    iconRegistry.addSvgIcon('eraser', sanitizer.bypassSecurityTrustResourceUrl('../../../assets/Tools-images/eraser.svg'));
    iconRegistry.addSvgIcon('ellipse', sanitizer.bypassSecurityTrustResourceUrl('../../../assets/Tools-images/ellipse.svg'));
    iconRegistry.addSvgIcon('rectangle', sanitizer.bypassSecurityTrustResourceUrl('../../../assets/Tools-images/rectangle.svg'));
  }
}
