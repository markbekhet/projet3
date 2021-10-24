import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { menuItems } from 'src/app/functionality';
import { Canvas } from 'src/app/models/canvas';
import { MenuItem } from 'src/app/models/menu-item';
import { InteractionService } from 'src/app/services/interaction-service/interaction.service';
import { ModalWindowService } from 'src/app/services/window-handler/modal-window.service';
import { NewDrawComponent } from '../../new-draw/new-draw.component';

@Component({
  selector: 'app-header-view',
  templateUrl: './header-view.component.html',
  styleUrls: ['./header-view.component.scss']
})
export class HeaderViewComponent implements OnInit {

  funcMenu: MenuItem[] = menuItems;
  canvasSub!: Subscription;
  currentCanvas!: Canvas;

  constructor(
    private winService: ModalWindowService,
    private interaction: InteractionService
  ) {

  }

  openNewDrawForm(){
    if (window.confirm('Un dessin est déjà en cours. Voulez-vous continuer?')) {
      this.winService.openWindow(NewDrawComponent);
      return;
    }
  }
  openGallery(){
    // TODO
  }

  ngOnInit(): void {
  }

}
