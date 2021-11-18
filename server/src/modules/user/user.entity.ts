import { Status } from "src/enumerators/user-status";
import { BaseEntity, BeforeInsert, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ConnectionHistory } from "../connectionHistory/connectionHistory.entity";
import { DisconnectionHistory } from "../disconnectionHistory/disconnectionHistory.entity";
import {v4 as uuidv4} from 'uuid';
import * as bcrypt from 'bcrypt';
import { DrawingEditionHistory } from "../drawingEditionHistory/drawingEditionHistory.entity";
import { JoinedDrawing } from "../joined-drawings/joined-drawings.entity";
import { JoinedTeam } from "../joined-teams/joined-teams.entity";

@Entity('User')
export class User extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({
        unique: true,
    })
    emailAddress: string;

    @Column()
    password: string;

    @Column({
        default: Status.ONLINE
    })
    status: Status;

    @Column({
        unique: true,
    })
    pseudo: string;

    @Column({
        default: 0,
        type:"double precision"
    })
    averageCollaborationTime: number;

    @Column({
        default: 0,
        type:"double precision"
    })
    totalCollaborationTime: number;

    @Column({
        default: 0
    })
    numberCollaborationTeams: number;

    @Column({
        default: 0
    })
    numberCollaboratedDrawings: number;

    @Column({
        default: 0 
    })
    numberAuthoredDrawings: number;

    @Column({type: "bytea", nullable: true})
    avatar: string;

    @OneToMany(()=> ConnectionHistory, connectionHistory => connectionHistory.user, {nullable:true})
    connectionHistories: ConnectionHistory[]

    @OneToMany(()=> DisconnectionHistory, disconnectionHistory => disconnectionHistory.user, {nullable: true})
    disconnectionHistories: DisconnectionHistory[]

    @OneToMany(()=>DrawingEditionHistory, drawingEditionHistory => drawingEditionHistory.user, {nullable: true})
    drawingEditionHistories: DrawingEditionHistory[] 

    @OneToMany(()=>JoinedDrawing, joinedDrawing=> joinedDrawing.user,{nullable: true})
    joinedDrawings: JoinedDrawing[]

    @OneToMany(()=>JoinedTeam, joinedTeam=> joinedTeam.user,{nullable: true})
    joinedTeams: JoinedTeam[]

    @BeforeInsert()
    async setPassword(){
        const salt = 10;
        this.password = await bcrypt.hash(this.password, salt)
    }

    public static createUserProfile(UserRegistrationInfo):User{
        let newUserProfile = new User();
        //console.log(newUserProfile.numberAuthoredDrawings, newUserProfile)
        newUserProfile.firstName = UserRegistrationInfo.firstName;
        newUserProfile.lastName = UserRegistrationInfo.lastName;
        newUserProfile.emailAddress = UserRegistrationInfo.emailAddress;
        newUserProfile.pseudo = UserRegistrationInfo.pseudo;
        newUserProfile.password = UserRegistrationInfo.password;
        return newUserProfile;
    }
}