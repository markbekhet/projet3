/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @angular-eslint/component-class-suffix */
import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';

import {
  DrawingContent,
  DrawingInfosForGallery,
  DrawingShownInGallery,
  JoinDrawing,
} from '@models/DrawingMeta';
import { DrawingVisibilityLevel } from '@models/VisibilityMeta';
import { AuthService } from '@services/authentication/auth.service';
import { DrawingService } from '@services/drawing/drawing.service';
import { SocketService } from '@services/socket/socket.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';
import { ActiveDrawing } from '@services/static-services/user_token';
import { DeleteDrawingComponent } from './delete-drawing/delete-drawing.component';
import { ModifyDrawingComponent } from './modify-drawing/modify-drawing.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit, AfterViewInit {
  shownDrawings: DrawingShownInGallery[] = [];

  constructor(
    private authService: AuthService,
    private bottomSheetService: MatBottomSheet,
    private drawingService: DrawingService,
    private renderer: Renderer2,
    private router: Router,
    private socketService: SocketService,
    private windowService: ModalWindowService
  ) {}

  getAuthenticatedUserID(): string {
    return this.authService.getAuthenticatedUserID();
  }

  ngOnInit(): void {
    // sortDrawings();
  }

  ngAfterViewInit(): void {
    this.authService
      .getPersonalGallery()
      .subscribe((data: { drawingList: DrawingInfosForGallery[] }) => {
        data.drawingList.forEach((value: DrawingInfosForGallery) => {
          const svg = this.createSVG(
            value.contents,
            value.width,
            value.height,
            value.bgColor
          );
          this.shownDrawings.push({
            infos: value,
            thumbnail: svg,
          });
        });

        console.log(
          'TURBO 🚀 - GalleryComponent - this.shownDrawings',
          this.shownDrawings
        );
      });
  }

  createSVG(
    contents: DrawingContent[],
    width: number,
    height: number,
    bgColor: string
  ): Element {
    const SVG = this.renderer.createElement(
      'svg',
      'http://www.w3.org/2000/svg'
    );
    this.renderer.setAttribute(SVG, 'width', width.toString());
    this.renderer.setAttribute(SVG, 'height', height.toString());

    const RECT = this.renderer.createElement('rect', 'svg');
    if (bgColor.charAt(0) !== '#') {
      // eslint-disable-next-line no-param-reassign
      bgColor = `#${bgColor}`;
    }
    this.renderer.setAttribute(RECT, 'fill', bgColor);
    this.renderer.setAttribute(RECT, 'height', '100%');
    this.renderer.setAttribute(RECT, 'width', '100%');
    this.renderer.appendChild(SVG, RECT);

    // IMO, we should create g tag only once, so we should not have it in the loop.
    // But maybe it needs to be in the loop to separate them in different g tags (like in old project 2).
    // But it works like that so I'm not gonna touch it.
    const TAG = this.renderer.createElement('g', 'http://www.w3.org/2000/svg');

    contents.forEach((value: DrawingContent) => {
      if (TAG !== undefined) {
        TAG.innerHTML += value.content;
        this.renderer.appendChild(SVG, TAG);
      }
    });
    return SVG;
  }

  editDrawing(drawingInfos: DrawingInfosForGallery) {
    if (drawingInfos.visibility === DrawingVisibilityLevel.PROTECTED) {
      this.openDrawingPasswordBottomSheet(drawingInfos);
      // TODO: terminer avec la saisie du mot de passe, si correct alors continuer, sinon break return
    }
    this.socketService.leaveDrawing();

    const joinDrawing: JoinDrawing = {
      drawingId: drawingInfos.id,
      userId: this.getAuthenticatedUserID(),
      password: undefined,
    };
    this.socketService.sendJoinDrawingRequest(joinDrawing);

    ActiveDrawing.drawingId = drawingInfos.id;
    this.drawingService.$drawingId.next(drawingInfos.id);

    // TODO: might need those two lines, like in drawing creation. (for example if we use the gallery in a dialog, we need it to close)
    this.closeModalForm();
    // this.interactionService.emitWipeSignal();

    this.router.navigate(['/draw']);
  }

  openDrawingPasswordBottomSheet(drawingInfos: DrawingInfosForGallery): void {
    this.bottomSheetService.open(DrawingPasswordBottomSheet, {
      data: { drawing: drawingInfos },
    });
  }

  openDeleteDrawingDialog(drawingInfos: DrawingInfosForGallery): void {
    this.windowService.openDialog(DeleteDrawingComponent, drawingInfos);
  }

  openModifyDrawingDialog(drawingInfos: DrawingInfosForGallery): void {
    this.windowService.openDialog(ModifyDrawingComponent, drawingInfos);
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

  // TODO: add these lines like in Kyro's project, they're useful in case there's no drawings in DB.
  getThumbnails(): void {
    //   this.showMessage();
    //   if (data.length === 0) {
    //     this.render.removeChild(this.cardsContainer.nativeElement, this.text);
    //     this.text = this.render.createText('Aucun dessin ne se trouve sur le serveur');
    //     this.render.appendChild(this.cardsContainer.nativeElement, this.text);
    // } else {
    // this.render.removeChild(this.cardsContainer, this.text);
    // this.hasLoaded = true;
    // this.allLoaded = true;
  }
}

@Component({
  selector: 'app-drawing-password-bottom-sheet',
  templateUrl: './drawing-password/drawing-password.component.html',
  styleUrls: ['./drawing-password/drawing-password.component.scss'],
})
export class DrawingPasswordBottomSheet {
  constructor(
    // private drawingService: DrawingService,
    private bottomSheetRef: MatBottomSheetRef<DrawingPasswordBottomSheet>
  ) {}

  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
