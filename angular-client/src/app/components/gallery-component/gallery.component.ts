/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @angular-eslint/component-class-suffix */
import { AfterViewInit, Component, Inject, OnInit, Renderer2 } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
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
import { DrawingInformations } from '@src/app/models/drawing-informations';
import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { TeamService } from '@src/app/services/team/team.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
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
    private windowService: ModalWindowService,
    private interactionService: InteractionService,
    private teamService: TeamService,
    private errorDialog: MatDialog,
  ) {}

  getAuthenticatedUserID(): string {
    return this.authService.getToken();
  }

  isAuthorized(ownerId: string): boolean{
    if(ownerId === this.getAuthenticatedUserID()){
      return true;
    }
    else{
      let teamFound = false;
      this.teamService.activeTeams.value.forEach((team)=>{
        if(team.id! === ownerId){
          teamFound = true;
        }
      })
      if(teamFound){
        return true
      }
    }
    return false;
  }

  ngOnInit(): void {
    // sortDrawings();
  }

  ngAfterViewInit(): void {
    // to receiving the drawing informations after join
    this.socketService
      .getDrawingInformations()
      .subscribe((drawingInformations: DrawingInformations)=>{
        this.interactionService.drawingInformations.next(drawingInformations.drawing);
        this.closeModalForm();
        this.router.navigate(['/draw']);
      })

    // Getting user gallery
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

      //Increasing number collaborators for a drawing when another user joins the drawing
      this.socketService.socket!.on("nbCollaboratorsDrawingIncreased", (data: any)=>{
        let drawingModified: {drawingId: number} = JSON.parse(data);
        this.shownDrawings.forEach((shownDrawing: DrawingShownInGallery)=>{
          if(drawingModified.drawingId === shownDrawing.infos.id){
            shownDrawing.infos.nbCollaborators += 1;
          }
        })
      })

      // Reducing number collaborators for a drawing when another user leaves the drawing
      this.socketService.socket!.on("nbCollaboratorsDrawingReduced", (data: any)=>{
        let drawingModified: {drawingId: number} = JSON.parse(data);
        this.shownDrawings.forEach((shownDrawing: DrawingShownInGallery)=>{
          if(drawingModified.drawingId === shownDrawing.infos.id){
            shownDrawing.infos.nbCollaborators -= 1;
          }
        })
      })

      //Receiving notification when a drawing is deleted
      this.socketService.socket!.on("drawingDeleted", (data: any)=>{
        let drawingDeleted: {id: number} = JSON.parse(data);
        let deleted = false;
        this.shownDrawings.forEach((shownDrawing: DrawingShownInGallery)=>{
          if(!deleted && drawingDeleted.id === shownDrawing.infos.id){
            deleted = true;
            let index = this.shownDrawings.indexOf(shownDrawing);
            this.shownDrawings.splice(index, 1)
          }
        })
        //TODO: Handle case that the drawing is private but is a proprety of a team
      })

      // Receiving when a drawing is created
      this.socketService.socket!.on("newDrawingCreated", (darwingString:any)=>{
        let drawing: DrawingInfosForGallery = JSON.parse(darwingString);
        if(drawing.visibility !== DrawingVisibilityLevel.PRIVATE || (drawing.visibility === DrawingVisibilityLevel.PRIVATE && drawing.ownerId! === this.getAuthenticatedUserID())){
          const svg = this.createSVG(
            drawing.contents,
            drawing.width,
            drawing.height,
            drawing.bgColor,
          )
          this.shownDrawings.push({
            infos: drawing,
            thumbnail: svg
          })
        }
        // Add else statement if the drawing is private but associated to a team that we have joined
      })

      this.socketService.socket!.on("drawingModified", (data: any)=>{
        let drawingInfosForGallery: DrawingInfosForGallery = JSON.parse(data);
        let isUserGallery = drawingInfosForGallery.visibility !== DrawingVisibilityLevel.PRIVATE ||
         (drawingInfosForGallery.ownerId! === this.getAuthenticatedUserID() &&
          drawingInfosForGallery.visibility === DrawingVisibilityLevel.PRIVATE)
        let found = false;
        this.shownDrawings.forEach((drawing:DrawingShownInGallery)=>{
          if(drawing.infos.id === drawingInfosForGallery.id){
            console.log('drawing found')
            console.log(drawingInfosForGallery.visibility)
            found = true;
            if(!isUserGallery){
              this.shownDrawings.splice(this.shownDrawings.indexOf(drawing), 1)
            }
            else{
              console.log('modifying the name')
              console.log(drawingInfosForGallery.name)
              drawing.infos.name = drawingInfosForGallery.name;
              drawing.infos.visibility = drawingInfosForGallery.visibility;
            }
          }
        })
        if(!found && isUserGallery){
          const svg = this.createSVG(
            drawingInfosForGallery.contents,
            drawingInfosForGallery.width,
            drawingInfosForGallery.height,
            drawingInfosForGallery.bgColor,
          )
          this.shownDrawings.push({
            infos: drawingInfosForGallery,
            thumbnail: svg
          })
        }
      })
      this.socketService.socket!.on("cantJoinDrawing", (data: any)=>{
        let errorMessage:{message: string} = JSON.parse(data);
        this.errorDialog.open(ErrorDialogComponent, {data: errorMessage.message});
      })
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
    // Note (Paul) : might need that to fix a bug
    // this.socketService.leaveDrawing();

    else{
      const joinDrawing: JoinDrawing = {
        drawingId: drawingInfos.id,
        userId: this.authService.getToken(),
        password: undefined,
      };
      this.socketService.sendJoinDrawingRequest(joinDrawing);

      this.drawingService.$drawingId.next(drawingInfos.id);
    }
    // TODO: might need those two lines, like in drawing creation. (for example if we use the gallery in a dialog, we need it to close)
    
    // this.interactionService.emitWipeSignal();

    
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
  password: string = ''
  userId: string;
  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    // private drawingService: DrawingService,
    private bottomSheetRef: MatBottomSheetRef<DrawingPasswordBottomSheet>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private infos: {drawing: DrawingInfosForGallery}
  ) {
    console.log(this.infos.drawing.id);
    this.userId = this.authService.token$.value
  }

  /*openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }*/
  close(event: MouseEvent){
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  submit(event: MouseEvent){
    const joinDrawingRequest: JoinDrawing = {drawingId: this.infos.drawing.id, userId: this.userId, password: this.password}
    console.log(joinDrawingRequest);
    this.close(event)
    this.socketService.sendJoinDrawingRequest(joinDrawingRequest);
  }
}
