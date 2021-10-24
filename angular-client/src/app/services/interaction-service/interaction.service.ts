import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DrawingContent } from 'src/app/models/drawing-content';

// this service can be used to communicate tool selection between components and color change to the tools.
// It will be used to test the tools without connecting to socket so we can immulate the server but with one client.
@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  drawing: Subject<DrawingContent> = new Subject<DrawingContent>();
  $drawing: Observable<DrawingContent> = this.drawing.asObservable();

  ref: Subject<ElementRef> = new Subject<ElementRef>()
  $refObs: Observable<ElementRef> = this.ref.asObservable();

  emitDrawingContent(content: DrawingContent){
    this.drawing.next(content);
  }

  emitRef(el:ElementRef){
    this.ref.next(el);
  }
  constructor() {

   }
}
