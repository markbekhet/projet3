import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Drawing } from "../drawing/drawing.entity";
import { Team } from "../team/team.entity";

@Entity('active-user')
export class ActiveUser extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @ManyToOne(()=> Drawing, drawing=> drawing.activeUsers, {nullable: true, onDelete:'CASCADE'})
    drawing: Drawing;

    @ManyToOne(()=> Team, team=> team.activeUsers, {nullable: true, onDelete:"CASCADE"})
    team: Team;
}