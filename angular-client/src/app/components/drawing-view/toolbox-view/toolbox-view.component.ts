import { Component, OnInit } from '@angular/core';

import { toolItems } from '@src/app/features';
import { FeatureItem } from '@models/FeatureItem';
import { IconsService } from '@services/icons/icons.service';
import { InteractionService } from '@services/interaction-service/interaction.service';

@Component({
  selector: 'app-toolbox-view',
  templateUrl: './toolbox-view.component.html',
  styleUrls: ['./toolbox-view.component.scss'],
})
export class ToolboxViewComponent implements OnInit {
  toolItems: FeatureItem[];
  activeButton: string = 'Crayon';
  // selectingToolsMap: Map<string, string> = new Map();
  constructor(
    public icons: IconsService,
    private interactionTool: InteractionService
  ) {
    this.toolItems = toolItems;
  }

  ngOnInit(): void {
    this.interactionTool.emitSelectedTool(this.activeButton);
  }

  buttonAction(name: string) {
    this.interactionTool.emitSelectedTool(name);
    this.activeButton = name;
  }
}
