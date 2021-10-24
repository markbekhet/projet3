import { AfterViewInit, Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction-service/interaction.service';

@Component({
  selector: 'app-option-view',
  templateUrl: './option-view.component.html',
  styleUrls: ['./option-view.component.scss']
})
export class OptionViewComponent implements OnInit, AfterViewInit {

  lineThickness: number;

  selectedTool: string = "Crayon";
  tools: string[] = []
  constructor(private interaction: InteractionService)
  {
    this.tools = [
      'Rectangle',
      'Crayon',
      'Ellipse',
      'Efface',
    ];
    const DEF_THICK = 20;
    this.lineThickness = DEF_THICK;
  }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.interaction.$selectedTool.subscribe((tool: string)=>{
      let toolExist = false;
      this.tools.forEach((el: string) => {
          if (el === tool) {
              toolExist = true;
          }
      });
      if (toolExist) {
          this.selectedTool = tool;
          console.log(tool);
      }
    })
  }
  updateTools(){
    // TODO:
  }
  updateForms(){
    // TODO:
  }

}
