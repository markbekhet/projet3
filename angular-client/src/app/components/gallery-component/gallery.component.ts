/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @angular-eslint/component-class-suffix */
import {
  AfterViewInit,
  Component,
  // ElementRef,
  Inject,
  OnInit,
  Renderer2,
  // ViewChild,
} from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { ActiveUser } from '@models/active-user';
import {
  DrawingContent,
  DrawingInfosForGallery,
  DrawingShownInGallery,
  JoinDrawing,
} from '@models/DrawingMeta';
import { DrawingVisibilityLevel } from '@models/VisibilityMeta';
import { DrawingInformations } from '@models/drawing-informations';
import { ChatHistory } from '@models/MessageMeta';
import { TeamInformations } from '@models/teamsMeta';

import { AuthService } from '@services/authentication/auth.service';
import { ChatRoomService } from '@src/app/services/chat-room/chat-room.service';
import {
  DrawingService,
  userColorMap,
} from '@services/drawing/drawing.service';
import { InteractionService } from '@src/app/services/interaction/interaction.service';
import { SocketService } from '@services/socket/socket.service';
import { TeamService } from '@src/app/services/team/team.service';
import { ModalWindowService } from '@services/window-handler/modal-window.service';

import { DeleteDrawingComponent } from '@components/gallery-component/delete-drawing/delete-drawing.component';
import { ErrorDialogComponent } from '@components/error-dialog/error-dialog.component';
import { ModifyDrawingComponent } from '@components/gallery-component/modify-drawing/modify-drawing.component';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit, AfterViewInit {
  shownDrawings: DrawingShownInGallery[] = [];
  teamIds: string[];

  allLoaded: boolean = false;

  // @ViewChild('gallery-grid', { static: false })
  // galleryGrid!: ElementRef;

  // @ViewChild('galleryStateText', { static: false })
  // galleryStateText!: ElementRef;

  constructor(
    private authService: AuthService,
    private bottomSheetService: MatBottomSheet,
    private chatRoomService: ChatRoomService,
    private drawingService: DrawingService,
    private errorDialog: MatDialog,
    private interactionService: InteractionService,
    private router: Router,
    private renderer: Renderer2,
    private socketService: SocketService,
    private teamService: TeamService,
    private windowService: ModalWindowService
  ) {
    this.teamIds = [];
    this.teamService.activeTeams.value.forEach((team) => {
      this.teamIds.push(team.id!);
      // TODO:
      this.socketService.getTeamGallery({ teamName: team.name! });
    });
  }

  getAuthenticatedUserID(): string {
    return this.authService.getUserToken();
  }

  // isAbleToLeave() {
  //   const user: ActiveUser = {
  //     id: undefined,
  //     userId: this.getAuthenticatedUserID(),
  //   };
  //   console.log('TURBO 🚀 - L99 - GalleryComponent - user', user);

  //   console.log(
  //     'TURBO 🚀 - L102 - GalleryComponent - interactionService.currentDrawingActiveUsers.value',
  //     this.interactionService.currentDrawingActiveUsers.value
  //   );

  //   return this.interactionService.currentDrawingActiveUsers.value.includes(
  //     user
  //   );
  // }

  isAuthorized(ownerId: string): boolean {
    if (ownerId === this.getAuthenticatedUserID()) {
      return true;
    }

    if (this.teamIds.includes(ownerId)) {
      return true;
    }

    return false;
  }

  displayImagePlaceholderIfProtected() {}

  ngOnInit(): void {
    // sortDrawings();
  }

  ngAfterViewInit(): void {
    // To receive drawing's informations after joining
    this.socketService
      .getDrawingInformations()
      .subscribe((drawingInformations: DrawingInformations) => {
        this.drawingService.drawingName$.next(
          drawingInformations.drawing.name!
        );
        this.chatRoomService.addChatRoom(
          drawingInformations.drawing.name!,
          drawingInformations.chatHistoryList
        );
        this.interactionService.drawingInformations.next(
          drawingInformations.drawing
        );
        this.interactionService.currentDrawingActiveUsers.next(
          drawingInformations.activeUsers
        );
        this.interactionService.emitUpdateChatListSignal();
        this.closeModalForm();
        this.router.navigate(['/draw']);
      });

    // Getting teams and their galleries
    this.socketService.socket!.on('teamInformations', (data: any) => {
      const teamInformations: {
        chatHistoryList: ChatHistory[];
        drawingList: DrawingInfosForGallery[];
        activeUsers: ActiveUser[];
      } = JSON.parse(data);
      const requestedTeam = this.teamService.requestedTeamToJoin.value;
      const newJoinedTeam: TeamInformations = {
        id: requestedTeam.id,
        name: requestedTeam.name,
        visibility: requestedTeam.visibility,
        ownerId: requestedTeam.ownerId,
        bio: requestedTeam.bio,
        gallery: teamInformations.drawingList,
        activeUsers: teamInformations.activeUsers,
      };
      this.teamService.activeTeams.value.set(requestedTeam.name, newJoinedTeam);
      this.chatRoomService.addChatRoom(
        requestedTeam.name!,
        teamInformations.chatHistoryList
      );
      this.interactionService.emitUpdateChatListSignal();
      this.teamIds.push(requestedTeam.id!);
      this.createDrawingsShownInGalleryFromArray(teamInformations.drawingList);

      // this.getThumbnails(teamInformations.drawingList);
    });

    // Getting user's own gallery
    this.authService
      .getPersonalGallery()
      .subscribe((data: { drawingList: DrawingInfosForGallery[] }) => {
        this.createDrawingsShownInGalleryFromArray(data.drawingList);
        console.log(
          'TURBO 🚀 - GalleryComponent - this.shownDrawings',
          this.shownDrawings
        );
        // this.getThumbnails(data.drawingList);
      });

    // Increasing number of collaborators for a drawing when another user joins the drawing
    this.socketService.socket!.on(
      'nbCollaboratorsDrawingIncreased',
      (data: any) => {
        const drawingModified: { drawingId: number } = JSON.parse(data);
        this.shownDrawings.forEach((shownDrawing: DrawingShownInGallery) => {
          if (drawingModified.drawingId === shownDrawing.infos.id) {
            shownDrawing.infos.nbCollaborators += 1;
          }
        });
      }
    );

    // Reducing number of collaborators for a drawing when another user leaves the drawing
    this.socketService.socket!.on(
      'nbCollaboratorsDrawingReduced',
      (data: any) => {
        const drawingModified: { drawingId: number } = JSON.parse(data);
        this.shownDrawings.forEach((shownDrawing: DrawingShownInGallery) => {
          if (drawingModified.drawingId === shownDrawing.infos.id) {
            if (shownDrawing.infos.nbCollaborators > 0)
              shownDrawing.infos.nbCollaborators -= 1;
          }
        });
      }
    );

    // Receiving notification when a drawing is deleted
    this.socketService.socket!.on('drawingDeleted', (data: any) => {
      const drawingDeleted: { id: number } = JSON.parse(data);
      let deleted = false;
      this.shownDrawings.forEach((shownDrawing: DrawingShownInGallery) => {
        if (!deleted && drawingDeleted.id === shownDrawing.infos.id) {
          deleted = true;
          const index = this.shownDrawings.indexOf(shownDrawing);
          this.shownDrawings.splice(index, 1);
        }
      });
      // TODO: Handle case that the drawing is private but is a proprety of a team
    });

    // Receiving when a drawing is created
    this.socketService.socket!.on('newDrawingCreated', (darwingString: any) => {
      const drawing: DrawingInfosForGallery = JSON.parse(darwingString);
      if (
        drawing.visibility !== DrawingVisibilityLevel.PRIVATE ||
        (drawing.visibility === DrawingVisibilityLevel.PRIVATE &&
          this.isAuthorized(drawing.ownerId!))
      ) {
        this.createDrawingShownInGalleryFromInfo(drawing);
      }
      // Add else statement if the drawing is private but associated to a team that we have joined
    });

    // Receiving when a drawing is modified
    this.socketService.socket!.on('drawingModified', (data: any) => {
      const drawingInfosForGallery: DrawingInfosForGallery = JSON.parse(data);
      const isUserGallery =
        drawingInfosForGallery.visibility !== DrawingVisibilityLevel.PRIVATE ||
        (this.isAuthorized(drawingInfosForGallery.ownerId!) &&
          drawingInfosForGallery.visibility === DrawingVisibilityLevel.PRIVATE);
      let found = false;
      this.shownDrawings.forEach((drawing: DrawingShownInGallery) => {
        if (drawing.infos.id === drawingInfosForGallery.id) {
          console.log('drawing found');
          console.log(drawingInfosForGallery.visibility);
          found = true;
          if (!isUserGallery) {
            this.shownDrawings.splice(this.shownDrawings.indexOf(drawing), 1);
          } else {
            console.log('modifying the name');
            console.log(drawingInfosForGallery.name);
            drawing.infos.name = drawingInfosForGallery.name;
            drawing.infos.visibility = drawingInfosForGallery.visibility;
          }
        }
      });
      if (!found && isUserGallery) {
        this.createDrawingShownInGalleryFromInfo(drawingInfosForGallery);
      }
    });

    // Receiving when user can't join drawing
    this.socketService.socket!.on('cantJoinDrawing', (data: any) => {
      const errorMessage: { message: string } = JSON.parse(data);
      this.errorDialog.open(ErrorDialogComponent, {
        data: errorMessage.message,
      });
    });

    // Receiving when we receive teams galleries
    this.socketService.socket!.on('teamGallery', (data: any) => {
      const drawingInfosForGallery: { drawingList: DrawingInfosForGallery[] } =
        JSON.parse(data);
      this.createDrawingsShownInGalleryFromArray(
        drawingInfosForGallery.drawingList
      );
      // this.getThumbnails(drawingInfosForGallery.drawingList);
    });

    this.interactionService.$updateGallerySignal.subscribe((sig) => {
      if (sig) {
        const teamId = this.teamService.leftTeamId.value;
        this.teamIds.splice(this.teamIds.indexOf(teamId), 1);
        this.shownDrawings.forEach((shownDrawing: DrawingShownInGallery) => {
          if (
            shownDrawing.infos.ownerId === teamId &&
            shownDrawing.infos.visibility === DrawingVisibilityLevel.PRIVATE
          ) {
            this.shownDrawings.splice(
              this.shownDrawings.indexOf(shownDrawing),
              1
            );
          }
        });
        // this.getThumbnails(drawingInfosForGallery.drawingList);
      }
    });
  }

  // To generate drawings, which will be shown in gallery, from an array received by server
  createDrawingsShownInGalleryFromArray(drawings: DrawingInfosForGallery[]) {
    drawings.forEach((drawingInfo: DrawingInfosForGallery) => {
      this.createDrawingShownInGalleryFromInfo(drawingInfo);
    });
    this.allLoaded = true;
  }

  // To generate individual drawing, which will be shown in gallery : its infos and thumbnail
  createDrawingShownInGalleryFromInfo(drawingInfo: DrawingInfosForGallery) {
    const svg = this.createSVG(
      drawingInfo.contents,
      drawingInfo.width,
      drawingInfo.height,
      drawingInfo.bgColor
    );
    this.shownDrawings.push({
      infos: drawingInfo,
      thumbnail: svg,
    });
    this.allLoaded = true;
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

  displayVisibilityIcon(visibilityLevel: DrawingVisibilityLevel): string {
    switch (visibilityLevel) {
      case 0:
        return 'public';
      case 1:
        return 'lock';
      case 2:
        return 'person'; // visibility, person, not_interested, remove_circle, portrait
      default:
        return '';
    }
  }

  leaveDrawing() {
    this.interactionService.emitLeaveDrawingSignal();
    this.socketService.leaveDrawing({
      drawingId: this.drawingService.getActiveDrawingID(),
      userId: this.authService.getUserToken(),
    });
    this.chatRoomService.chatRooms.delete(
      this.drawingService.drawingName$.value
    );
    this.interactionService.emitUpdateChatListSignal();
    this.drawingService.drawingName$.next('');
    userColorMap.set('#0000FF', undefined);
    userColorMap.set('#00FF00', undefined);
    userColorMap.set('#0000FF', undefined);
  }

  editDrawing(drawingInfos: DrawingInfosForGallery) {
    if (drawingInfos.visibility === DrawingVisibilityLevel.PROTECTED) {
      this.openDrawingPasswordBottomSheet(drawingInfos);
      // TODO: terminer avec la saisie du mot de passe, si correct alors continuer, sinon break return
    }
    // Note (Paul) : might need that to fix a bug
    // this.socketService.leaveDrawing();
    else {
      const joinDrawing: JoinDrawing = {
        drawingId: drawingInfos.id,
        userId: this.authService.getUserToken(),
        password: undefined,
      };
      this.socketService.sendJoinDrawingRequest(joinDrawing);

      this.drawingService.drawingId$.next(drawingInfos.id);
    }
    // TODO: might need those two lines, like in drawing creation. (for example if we use the gallery in a dialog, we need it to close)

    // this.interactionService.emitWipeSignal();
  }

  openDrawingPasswordBottomSheet(drawingInfos: DrawingInfosForGallery): void {
    this.bottomSheetService.open(DrawingPasswordBottomSheet, {
      data: { drawingId: drawingInfos.id },
    });
  }

  openDeleteDrawingDialog(drawingInfos: DrawingInfosForGallery): void {
    this.windowService.openDialog(DeleteDrawingComponent, drawingInfos);
  }

  openModifyDrawingDialog(drawingInfos: DrawingInfosForGallery): void {
    this.windowService.openDialog(ModifyDrawingComponent, drawingInfos);
  }

  // Note(Paul) : WIP - goal is to return same date that comes from server but format the hour in 24-hour format so that
  // it takes less space in the UI
  // https://www.w3schools.com/js/js_string_methods.asp
  // https://www.w3schools.com/js/js_dates.asp
  // https://www.w3schools.com/js/js_date_formats.asp
  // https://stackoverflow.com/questions/1788705/convert-time-to-24-hours-format-in-javascript
  /* formatHour(creationDate: string): string {
    const dateInArrayForm = creationDate.split(',');
    const date = dateInArrayForm[0];
    const hour = dateInArrayForm[1];
    return;
  } */

  /* sortDrawings() {
    for (let i = 0; i < this.drawings.length; i++) {
      if (
        this.drawings[i].ownerId === this.authService.getAuthenticatedUserID()
      ) {
      }
    }
  } */

  closeModalForm(): void {
    this.windowService.closeDialogs();
  }
}

@Component({
  selector: 'app-drawing-password-bottom-sheet',
  templateUrl: './drawing-password/drawing-password.component.html',
  styleUrls: ['./drawing-password/drawing-password.component.scss'],
})
export class DrawingPasswordBottomSheet {
  password: string = '';
  userId: string;
  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private drawingService: DrawingService,
    private bottomSheetRef: MatBottomSheetRef<DrawingPasswordBottomSheet>,
    @Inject(MAT_BOTTOM_SHEET_DATA)
    private infos: { drawingId: number }
  ) {
    console.log(this.infos.drawingId);
    this.userId = this.authService.token$.value;
  }

  /* openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  } */
  close(event: MouseEvent) {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }

  submit(event: MouseEvent) {
    const joinDrawingRequest: JoinDrawing = {
      drawingId: this.infos.drawingId,
      userId: this.userId,
      password: this.password,
    };
    console.log(joinDrawingRequest);
    this.close(event);
    this.socketService.sendJoinDrawingRequest(joinDrawingRequest);
    this.drawingService.drawingId$.next(this.infos.drawingId);
  }
}
