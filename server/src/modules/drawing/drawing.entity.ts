import { visibility } from 'src/enumerators/visibility';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CreateDrawingDto } from './create-drawing.dto';
import * as bcrypt from 'bcrypt';
import { DrawingContent } from '../drawing-content/drawing-content.entity';

@Entity('drawing')
export class Drawing extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creationDate: string;

  @Column({
    unique: true,
  })
  name: string;

  @Column()
  visibility: visibility;

  @Column({
    nullable: true,
  })
  password: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  bgColor: string;

  @OneToMany(() => DrawingContent, (drawingContent) => drawingContent.drawing, {
    nullable: true,
  })
  contents: DrawingContent[];

  @Column()
  ownerID: string;

  @BeforeInsert()
  async setPassword() {
    if (this.password !== undefined) {
      const salt = 10;
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  static createDrawing(drawingInformation: CreateDrawingDto) {
    const newDrawing = new Drawing();
    newDrawing.name = drawingInformation.name;
    newDrawing.visibility = drawingInformation.visibility;
    newDrawing.password = drawingInformation.password;
    newDrawing.width = drawingInformation.width;
    newDrawing.height = drawingInformation.height;
    newDrawing.bgColor = drawingInformation.bgColor;
    newDrawing.ownerID = drawingInformation.ownerID;
    return newDrawing;
  }
}
