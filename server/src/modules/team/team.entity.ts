import { visibility } from "src/enumerators/visibility";
import { BaseEntity, BeforeInsert, Column, Entity,PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt'
import { CreateTeamDto } from "./create-team.dto";

@Entity("team")
export class Team extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    visibility: visibility;

    @Column({nullable: true})
    password: string;

    @Column()
    name: string;

    @Column()
    ownerId: string;

    @Column({default:4})
    maximumCollaborators: number;

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
    }
}