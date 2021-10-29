import { AfterViewInit, Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { ShapeTypes } from 'src/app/services/draw-tool/tools-attributes';
import { InteractionService } from 'src/app/services/interaction-service/interaction.service';

@Component({
  selector: 'app-option-view',
  templateUrl: './option-view.component.html',
  styleUrls: ['./option-view.component.scss']
})
export class OptionViewComponent implements OnInit, AfterViewInit {

  pencilLineThickness: number;
  shapeLineThickness: number;
  shapeType: ShapeTypes;

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
    const DEF_THICK = 5;
    const DEF_SHAPE_TYPE = ShapeTypes.OUTLINE;

    this.pencilLineThickness = DEF_THICK;
    this.shapeLineThickness = DEF_THICK;
    this.shapeType = DEF_SHAPE_TYPE;
  }
  ngAfterViewInit(): void {
    //throw new Error('Method not implemented.');
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

  updateTools() {
    this.interaction.emitToolsAttributes({
      pencilLineThickness: this.pencilLineThickness,
      shapeLineThickness: this.shapeLineThickness,
      shapeType: this.shapeType
    });
  }

  updateShapeType(shapeType: string) {
    switch(shapeType) {
      case 'OUTLINE': this.shapeType = ShapeTypes.OUTLINE;
        break;
      case 'FULL': this.shapeType = ShapeTypes.FULL;
        break;
      case 'BOTH': this.shapeType = ShapeTypes.BOTH;
        break;
    }
    this.updateTools();
  }

  updateForms(){
    // TODO:
  }

}

@Pipe({ name: 'shapetype'})
export class ShapeTypePipe implements PipeTransform {
  transform(value: string) {
    switch(value) {
      case 'OUTLINE': return 'Contours';
      case 'FULL': return 'Plein';
      case 'BOTH': return 'Contours + Plein';
    }
    return value;
  }
}
