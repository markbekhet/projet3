import { visibility } from "src/enumerators/visibility";
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CreateDrawingDto } from "./create-drawing.dto";
import * as bcrypt from 'bcrypt';
import { DrawingContent } from "../drawing-content/drawing-content.entity";
import { ChatRoom } from "../chatRoom/chat-room.entity";

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

    @Column({
        unique: true,
    })
    name: string;

    @Column()
    bgColor: string;

    @OneToMany(()=> DrawingContent, drawingContent=> drawingContent.drawing, {nullable: true})
    contents: DrawingContent[];

    @OneToOne(()=> ChatRoom, chatRoom => chatRoom.drawing, {cascade: true})
    @JoinColumn()
    chatRoom: ChatRoom
    
    @BeforeInsert()
    async setPassword(){
        if(this.password !== undefined){
            const salt = 10;
            this.password = await bcrypt.hash(this.password, salt)
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
        newDrawing.bgColor = drawingInformation.color;
        return newDrawing;
    }
}