import { BaseEntity, BeforeInsert, Column, Entity, Generated, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity("DisonnectionHistory")
export class DisconnectionHistory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type: 'timestamp',
        default: ()=> "CURRENT_TIMESTAMP"
    })
    date:string

    @ManyToOne(()=> User, user => user.disconnectionHistories, {nullable: true,onDelete:"CASCADE"})
    user: User

}