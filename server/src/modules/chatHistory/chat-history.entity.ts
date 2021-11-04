import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoom } from "../chatRoom/chat-room.entity";

@Entity("chatHistory")
export class ChatHistory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    from: string;

    @Column({
        type:"timestamp"
    })
    date: string;

    @Column()
    message: string;

    @ManyToOne(()=> ChatRoom, chatRoom=> chatRoom.chatHistories)
    ChatRoom;
    
}