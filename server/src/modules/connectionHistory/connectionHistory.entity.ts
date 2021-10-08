import { BaseEntity, BeforeInsert, Column, Entity, Generated, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity("ConnectionHistory")
export class ConnectionHistory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type: 'timestamp',
        default: ()=> "CURRENT_TIMESTAMP"
    })
    date:string

    @ManyToOne(()=> User, user => user.connectionHistories)
    user: User

}