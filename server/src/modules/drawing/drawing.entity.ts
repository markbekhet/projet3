import { DrawingVisibility } from "src/enumerators/visibility";
import { BaseEntity, BeforeInsert, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CreateDrawingDto } from "./create-drawing.dto";
import * as bcrypt from 'bcrypt';
import { DrawingContent } from "../drawing-content/drawing-content.entity";
import { ChatRoom } from "../chatRoom/chat-room.entity";
import { ActiveUser } from "../active-users/active-users.entity";

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
    visibility: DrawingVisibility;

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

    @OneToMany(()=> DrawingContent, drawingContent=> drawingContent.drawing, {nullable: true,})
    contents: DrawingContent[];

    @OneToOne(()=> ChatRoom, chatRoom => chatRoom.drawing, {cascade: true, onDelete:'CASCADE'})
    @JoinColumn()
    chatRoom: ChatRoom
    
    @OneToMany(()=> ActiveUser, activeUser=> activeUser.drawing, {nullable: true})
    activeUsers: ActiveUser[]

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
        let newChatRoom = new ChatRoom();
        newChatRoom.name = drawingInformation.name;
        newDrawing.chatRoom = newChatRoom;
        return newDrawing;
    }
}