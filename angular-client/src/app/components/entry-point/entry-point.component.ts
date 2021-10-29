import { Component, OnInit } from '@angular/core';
import { ModalWindowService } from 'src/app/services/window-handler/modal-window.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { menuItems } from 'src/app/functionality';
import { MenuItem } from 'src/app/models/menu-item';
import { NewDrawComponent } from '../new-draw/new-draw.component';

@Component({
  selector: 'app-entry-point',
  templateUrl: './entry-point.component.html',
  styleUrls: ['./entry-point.component.scss']
})
export class EntryPointComponent implements OnInit {

  menuItems: MenuItem[] = [];
  winService: ModalWindowService;
  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) { 
    this.winService = new ModalWindowService(this.dialog);
    this.menuItems = menuItems;
  }

  ngOnInit(): void {
    this.onOpen();
  }

  onOpen(): void {
    const CONFIG = new MatSnackBarConfig();
    const DURATION = 2500;
    CONFIG.duration = DURATION; // temps de visibilité de la barre de bienvenue (ms)
    this.snackBar.open('Bienvenue !', undefined, CONFIG);
  }
  openCreateNew(){
    this.winService.openWindow(NewDrawComponent);
  }
  openGallery(){
    // TODO: Implement
  }
  execute(shortcutName: string){
    switch(shortcutName){
      case 'Créer':{
        this.openCreateNew();
        break;
      }
      case 'Ouvrir':{
        this.openGallery();
        break;
      }
    }
  }
}
