import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction-service/interaction.service';

@Component({
  selector: 'app-draw-view',
  templateUrl: './draw-view.component.html',
  styleUrls: ['./draw-view.component.scss']
})
export class DrawViewComponent implements AfterViewInit {
  
  @ViewChild('workingSpace', {static: false}) workingSpaceRef! :ElementRef

  constructor(public interaction: InteractionService) { }

  ngAfterViewInit(): void {
    this.interaction.emitRef(this.workingSpaceRef);
  }

  adaptWindowSize(){
    window.dispatchEvent(new Event('resize'))
  }

}
