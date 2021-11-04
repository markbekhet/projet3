import { visibility } from "src/enumerators/visibility";
import { BaseEntity, BeforeInsert, Column, Entity,JoinColumn,OneToOne,PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { CreateTeamDto } from "./create-team.dto";
import { ChatRoom } from "../chatRoom/chat-room.entity";

@Entity("team")
export class Team extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    visibility: visibility;

    @Column({nullable: true})
    password: string;

    @Column({unique: true})
    name: string;

    @Column()
    ownerId: string;

    @Column({default:4})
    nbCollaborators: number;

    @OneToOne(()=> ChatRoom, chatRoom => chatRoom.drawing, {cascade: true})
    @JoinColumn()
    chatRoom: ChatRoom; 

    @BeforeInsert()
    async setPassword(){
        if(this.password !== undefined){
            const salt = 10;
            this.password = await bcrypt.hash(this.password, salt)
        }
    }

    static createTeam(dto: CreateTeamDto){
        let newTeam = new Team();
        newTeam.ownerId = dto.ownerId;
        newTeam.visibility = dto.visibility;
        newTeam.password = dto.password;
        newTeam.name = dto.name;
        let newChatRoom = new ChatRoom()
        newChatRoom.name = dto.name;
        newTeam.chatRoom = newChatRoom;
        return newTeam;
    }
}