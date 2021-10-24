import { Component, OnInit } from '@angular/core';
import { toolsItems } from 'src/app/functionality';
import { MenuItem } from 'src/app/models/menu-item';
import { IconsService } from 'src/app/services/icons/icons.service';
import { InteractionService } from 'src/app/services/interaction-service/interaction.service';

@Component({
  selector: 'app-toolbox-view',
  templateUrl: './toolbox-view.component.html',
  styleUrls: ['./toolbox-view.component.scss']
})
export class ToolboxViewComponent implements OnInit {

  funcTools: MenuItem[] = toolsItems;
  activeButton: string = "Crayon";
  //selectingToolsMap: Map<string, string> = new Map();
  constructor(private interactionTool: InteractionService, public icons: IconsService) { }

  ngOnInit(): void {
    this.interactionTool.emitSelectedTool(this.activeButton);
  }

  buttonAction(name: string){
    this.interactionTool.emitSelectedTool(name);
    this.activeButton = name;
  }

}
