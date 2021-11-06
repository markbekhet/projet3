import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity('joinedDrawing')
export class JoinedDrawing extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    drawingId: number;

    @ManyToOne(()=> User, user => user.joinedDrawings)
    user:User;
}