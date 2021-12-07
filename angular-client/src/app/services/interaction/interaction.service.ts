import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DrawingContent } from '@models/DrawingMeta';
import { ToolsAttributes } from '@services/drawing-tools/tools-attributes';
import { CanvasDetails } from '@src/app/models/drawing-informations';
import { ActiveUser } from '@src/app/models/active-user';

// this service can be used to communicate tool selection between components and color change to the tools.
// It will be used to test the tools without connecting to socket so we can immulate the server but with one client.
@Injectable({
  providedIn: 'root',
})
export class InteractionService {
  drawing = new Subject<DrawingContent>();
  $drawing = this.drawing.asObservable();

  ref = new Subject<ElementRef>();
  $refObs = this.ref.asObservable();

  selectedTool = new Subject<string>();
  $selectedTool = this.selectedTool.asObservable();

  toolsAttributes = new Subject<ToolsAttributes>();
  $toolsAttributes = this.toolsAttributes.asObservable();

  deleteDrawing = new Subject<boolean>();
  $deleteDrawing = this.deleteDrawing.asObservable();

  updateToolSignal = new Subject<boolean>();
  $updateToolSignal = this.updateToolSignal.asObservable();

  updateColorSignal = new Subject<boolean>();
  $updateColorSignal = this.updateColorSignal.asObservable();

  chatRoomName = new Subject<string>();
  $chatRoomName = this.chatRoomName.asObservable();

  generalRoomNameSignal = new Subject<boolean>();
  $generalRoomNameSignal = this.generalRoomNameSignal.asObservable();

  drawingInformations = new BehaviorSubject<CanvasDetails>({});
  // $drawingInformations = this.drawingInformations.asObservable()

  currentDrawingActiveUsers = new BehaviorSubject<ActiveUser[]>([]);

  wipeDrawing = new Subject<boolean>();
  $wipeDrawing = this.wipeDrawing.asObservable();

  leaveDrawingSignal = new Subject<boolean>();
  $leaveDrawingSignal = this.leaveDrawingSignal.asObservable();

  updateChatListSignal = new Subject<boolean>();
  $updateChatListSignal = this.updateChatListSignal.asObservable();

  updateGallerySignal = new Subject<boolean>();
  $updateGallerySignal = this.updateGallerySignal.asObservable();

  updateChatHistorySignal = new Subject<boolean>();
  $updateChatHistorySignal = this.updateChatHistorySignal.asObservable();

  snackbarAlreadyOpened = new BehaviorSubject<boolean>(false);

  emitDrawingContent(content: DrawingContent) {
    this.drawing.next(content);
  }

  emitRef(el: ElementRef) {
    this.ref.next(el);
  }

  emitSelectedTool(tool: string) {
    this.selectedTool.next(tool);
  }

  emitToolsAttributes(attr: ToolsAttributes | undefined): void {
    this.toolsAttributes.next(attr);
  }

  emitDelete() {
    this.deleteDrawing.next(true);
  }

  emitUpdateToolSignal() {
    this.updateToolSignal.next(true);
  }

  emitUpdateColorSignal() {
    this.updateColorSignal.next(true);
  }

  emitGetGeneralChatRoom() {
    this.generalRoomNameSignal.next(true);
  }

  emitFetchChatHistory(roomName: string) {
    this.chatRoomName.next(roomName);
  }

  emitWipeSignal() {
    this.wipeDrawing.next(true);
  }

  emitUpdateGallerySignal() {
    this.updateGallerySignal.next(true);
  }

  emitLeaveDrawingSignal() {
    this.leaveDrawingSignal.next(true);
  }

  emitUpdateChatListSignal() {
    this.updateChatListSignal.next(true);
  }

  emitUpdateChatHistory() {
    this.updateChatHistorySignal.next(true);
  }

  emitSnackbarAlreadyOpened() {
    this.snackbarAlreadyOpened.next(true);
  }
}
