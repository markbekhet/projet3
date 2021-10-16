import { visibility } from "src/enumerators/visibility";
import { BaseEntity, BeforeInsert, Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CreateDrawingDto } from "./create-drawing.dto";
import * as bcrypt from 'bcrypt';
import { DrawingContent } from "../drawing-content/drawing-content.entity";

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

    @Column({type:"boolean"})
    useOwnerPrivateInformation: boolean;

    @Column()
    bgColor: string;

    @OneToMany(()=> DrawingContent, drawingContent=> drawingContent.drawing, {nullable: true})
    contents: DrawingContent[];

    
    @BeforeInsert()
    async setPassword(){
        if(this.password !== undefined){
            const salt = 10;
            this.password = await bcrypt.hash(this.password, salt)
        }
    }
    @BeforeInsert()
    setUsagePrivateInfo(){
        if(this.useOwnerPrivateInformation=== undefined){
            this.useOwnerPrivateInformation = false;
        }
    }

    static createDrawing(drawingInformation: CreateDrawingDto) {
        let newDrawing = new Drawing()
        newDrawing.ownerId = drawingInformation.ownerId;
        newDrawing.visibility = drawingInformation.visibility;
        newDrawing.password = drawingInformation.password;
        newDrawing.height = drawingInformation.height;
        newDrawing.width = drawingInformation.width;
        newDrawing.name = drawingInformation.name;
        newDrawing.useOwnerPrivateInformation = drawingInformation.useOwnerPrivateInformation;
        newDrawing.bgColor = drawingInformation.color;
        return newDrawing;
    }
}