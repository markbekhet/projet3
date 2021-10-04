import { Status } from "src/interfaces/user";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserProfile{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    emailAddress: string;

    @Column()
    password: string;

    @Column()
    nbCollaboratedDrawings: number;

    @Column()
    nbAuthoredDrawings: number;

    @Column()
    status: Status

    @Column()
    connectionHistory: Date[]

    @Column()
    disconnectionHistory: Date[]

    
}