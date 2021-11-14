import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DrawingContent } from '@models/DrawingMeta';
import { ToolsAttributes } from '@services/drawing-tools/tools-attributes';

// this service can be used to communicate tool selection between components and color change to the tools.
// It will be used to test the tools without connecting to socket so we can immulate the server but with one client.
@Injectable({
  providedIn: 'root',
})
export class InteractionService {
  drawing: Subject<DrawingContent> = new Subject<DrawingContent>();
  $drawing: Observable<DrawingContent> = this.drawing.asObservable();

  ref: Subject<ElementRef> = new Subject<ElementRef>();
  $refObs: Observable<ElementRef> = this.ref.asObservable();

  selectedTool: Subject<string> = new Subject<string>();
  $selectedTool: Observable<string> = this.selectedTool.asObservable();

  toolsAttributes: Subject<ToolsAttributes> = new Subject<ToolsAttributes>();
  $toolsAttributes: Observable<ToolsAttributes> =
    this.toolsAttributes.asObservable();

  deleteDrawing: Subject<boolean> = new Subject<boolean>();
  $deleteDrawing: Observable<boolean> = this.deleteDrawing.asObservable();

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

  emitDelete(){
    this.deleteDrawing.next(true);
  }
}
