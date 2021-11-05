/* eslint-disable max-classes-per-file */
import {
  AfterViewInit,
  Component,
  OnInit,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ShapeTypes } from '@services/drawing-tools/tools-attributes';
import { InteractionService } from '@services/interaction/interaction.service';

@Component({
  selector: 'app-option-view',
  templateUrl: './option-view.component.html',
  styleUrls: ['./option-view.component.scss'],
})
export class OptionViewComponent implements OnInit, AfterViewInit {
  pencilLineThickness: number;
  shapeLineThickness: number;
  shapeType: ShapeTypes;

  selectedTool: string = 'Crayon';
  tools: string[] = [];

  constructor(private interaction: InteractionService) {
    this.tools = ['Rectangle', 'Crayon', 'Ellipse', 'Efface'];
    const DEF_THICK = 5;
    const DEF_SHAPE_TYPE = ShapeTypes.OUTLINE;

    this.pencilLineThickness = DEF_THICK;
    this.shapeLineThickness = DEF_THICK;
    this.shapeType = DEF_SHAPE_TYPE;
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngAfterViewInit(): void {
    // throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.interaction.$selectedTool.subscribe((tool: string) => {
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
    });
  }

  updateTools() {
    this.interaction.emitToolsAttributes({
      pencilLineThickness: this.pencilLineThickness,
      shapeLineThickness: this.shapeLineThickness,
      shapeType: this.shapeType,
    });
  }

  updateShapeType(shapeType: string) {
    switch (shapeType) {
      case 'OUTLINE':
        this.shapeType = ShapeTypes.OUTLINE;
        break;
      case 'FULL':
        this.shapeType = ShapeTypes.FULL;
        break;
      case 'BOTH':
        this.shapeType = ShapeTypes.BOTH;
        break;
      default:
        break;
    }
    this.updateTools();
  }

  updateForms() {
    // TODO:
  }
}

@Pipe({ name: 'shapetype' })
export class ShapeTypePipe implements PipeTransform {
  transform(value: string) {
    switch (value) {
      case 'OUTLINE':
        return 'Contours';
      case 'FULL':
        return 'Fond';
      case 'BOTH':
        return 'Contours + Fond';
      default:
        break;
    }
    return value;
  }
}
