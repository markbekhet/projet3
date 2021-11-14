import { Component, OnInit } from '@angular/core';
import { Drawing } from '@models/DrawingMeta';
import { DrawingVisibilityLevel } from '@models/VisibilityMeta';
import { AuthService } from '@services/authentication/auth.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  drawings: Drawing[] = [];

  constructor(
    private authService: AuthService,
    private windowService: ModalWindowService
  ) {
    this.authService.getPersonalGallery().subscribe((drawings: Drawing[]) => {
      this.drawings = drawings;
      console.log(
        'TURBO 🚀 - file: gallery.component.ts - line 17 - GalleryComponent - this.drawings',
        this.drawings
      );
    });
  }

  ngOnInit(): void {
    // sortDrawings();
  }

  displayVisibilityLevel(visibilityLevel: DrawingVisibilityLevel): string {
    switch (visibilityLevel) {
      case 0:
        return 'Public';
      case 1:
        return 'Protégé';
      case 2:
        return 'Privé';
      default:
        return '';
    }
  }

  deleteDrawing() {}

  // sortDrawings() {
  //   for (let i = 0; i < this.drawings.length; i++) {
  //     if (
  //       this.drawings[i].ownerId === this.authService.getAuthenticatedUserID()
  //     ) {
  //     }
  //   }
  // }

  closeModalForm(): void {
    this.windowService.closeDialogs();
  }

  getAuthenticatedUserID(): string {
    console.log(this.authService.getAuthenticatedUserID());
    return this.authService.getAuthenticatedUserID();
  }
}
