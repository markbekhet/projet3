import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatHistory } from "../chatHistory/chat-history.entity";
import { Drawing } from "../drawing/drawing.entity";
import { Team } from "../team/team.entity";

@Entity("chatRoom")
export class ChatRoom extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    name: string;

    @OneToMany(()=>ChatHistory, chatHistory => chatHistory.chatRoom, {nullable: true})
    chatHistories: ChatHistory[]

    @OneToOne(()=> Drawing, drawing => drawing.chatRoom, {nullable: true})
    drawing: Drawing;

    @OneToOne(()=> Team, team=> team.chatRoom, {nullable: true})
    team: Team;
}