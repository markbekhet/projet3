import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity("joinedTeams")
export class JoinedTeam extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    teamName: string;

    @ManyToOne(()=> User, user => user.joinedTeams)
    user: User;
}
