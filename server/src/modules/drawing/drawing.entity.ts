import { visibility } from "src/enumerators/visibility";
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CreateDrawingDto } from "./create-drawing.dto";
import * as bcrypt from 'bcrypt';

@Entity("drawing")
export class Drawing extends BaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    creationDate: string;

    @Column()
    ownerId: string;

    @Column()
    visibility: visibility;

    @Column({
        nullable: true
    })
    password: string;

    @Column()
    height: number;

    @Column()
    width: number;

    @Column()
    name: string;

    @Column({ nullable: true})
    content: string;

    @BeforeInsert()
    async setPassword(){
        const salt = 10;
        this.password = await bcrypt.hash(this.password, salt)
    }

    static createDrawing(drawingInformation: CreateDrawingDto) {
        let newDrawing = new Drawing()
        newDrawing.ownerId = drawingInformation.ownerId;
        newDrawing.visibility = drawingInformation.visibility;
        newDrawing.password = drawingInformation.password;
        newDrawing.height = drawingInformation.height;
        newDrawing.width = drawingInformation.width;
        newDrawing.name = drawingInformation.name;
        return newDrawing;
    }
}