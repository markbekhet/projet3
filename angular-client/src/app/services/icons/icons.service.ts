import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class IconsService {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'pencil',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/tools/pencil.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'eraser',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/tools/eraser.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'ellipse',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/tools/ellipse.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'rectangle',
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/tools/rectangle.svg'
      )
    );
    iconRegistry.addSvgIcon(
      'cursor', 
      sanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/Tools-images/cursor.svg'
      )
    );
  }
}
