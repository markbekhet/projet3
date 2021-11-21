import { Component, HostListener, OnInit } from '@angular/core';

import { toolItems, ToolItem } from '@models/FeatureMeta';
import { IconsService } from '@services/icons/icons.service';
import { InteractionService } from '@services/interaction/interaction.service';

@Component({
  selector: 'app-toolbox-view',
  templateUrl: './toolbox-view.component.html',
  styleUrls: ['./toolbox-view.component.scss'],
})
export class ToolboxViewComponent implements OnInit {
  toolItems: ToolItem[];
  activeButton: string = 'Crayon';
  // selectingToolsMap: Map<string, string> = new Map();

  constructor(
    public icons: IconsService,
    private interactionTool: InteractionService
  ) {
    this.toolItems = toolItems;
  }

  @HostListener('document: keydown', ['$event'])
  keyDown(event: KeyboardEvent){
    if(event.key === "Delete"){
      this.executeDeleteCommand()
    }
  }
  ngOnInit(): void {
    this.interactionTool.emitSelectedTool(this.activeButton);
  }

  buttonAction(name: string) {
    this.interactionTool.emitSelectedTool(name);
    this.activeButton = name;
  }
  executeDeleteCommand(){
    this.interactionTool.emitDelete()
  }
}
