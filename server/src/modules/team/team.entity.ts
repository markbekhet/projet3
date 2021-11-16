import {TeamVisibility } from "src/enumerators/visibility";
import { BaseEntity, BeforeInsert, Column, Entity,JoinColumn,OneToMany,OneToOne,PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { CreateTeamDto } from "./create-team.dto";
import { ChatRoom } from "../chatRoom/chat-room.entity";
import { ActiveUser } from "../active-users/active-users.entity";

@Entity("team")
export class Team extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    visibility: TeamVisibility;

    @Column({nullable: true})
    password: string;

    @Column({unique: true})
    name: string;

    @Column()
    ownerId: string;

    @Column({default:4})
    nbCollaborators: number;

    @OneToOne(()=> ChatRoom, chatRoom => chatRoom.drawing, {cascade: true, onDelete:'CASCADE'})
    @JoinColumn()
    chatRoom: ChatRoom; 

    @OneToMany(()=> ActiveUser, activeUser=> activeUser.team, {nullable: true})
    activeUsers: ActiveUser[]
    @BeforeInsert()
    async setPassword(){
        if(this.password !== undefined && this.password !== null){
            const salt = 10;
            this.password = await bcrypt.hash(this.password, salt)
        }
    }

    static createTeam(dto: CreateTeamDto){
        let newTeam = new Team();
        newTeam.ownerId = dto.ownerId;
        newTeam.visibility = dto.visibility;
        newTeam.password = dto.password;
        newTeam.nbCollaborators = dto.nbCollaborators;
        newTeam.name = dto.name;
        let newChatRoom = new ChatRoom()
        newChatRoom.name = dto.name;
        newTeam.chatRoom = newChatRoom;
        return newTeam;
    }
}