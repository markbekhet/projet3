import { Status } from "src/interfaces/user";
import { BaseEntity, BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConnectionHistory } from "../connectionHistory/connectionHistory.entity";
import { DisconnectionHistory } from "../disconnectionHistory/disconnectionHistory.entity";
//import * as uuidv4from "uuid";
//import * as bcrypt from 'bcryptjs';

@Entity('User')
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    emailAddress: string;

    @Column()
    password: string;

    @Column({default: 0})
    nbCollaboratedDrawings: number;

    @Column({default: 0})
    nbAuthoredDrawings: number;

    @Column({
        default: Status.ONLINE
    })
    status: Status;

    @Column()
    pseudo: string;

    @OneToMany(()=> ConnectionHistory, connectionHistory => connectionHistory.user)
    connectionHistory: ConnectionHistory[]

    @OneToMany(()=> DisconnectionHistory, disconnectionHistory => disconnectionHistory.user)
    disconnectionHistory: DisconnectionHistory[]

    public static createUserProfile(UserRegistrationInfo):User{
        let newUserProfile = new User();
        newUserProfile.firstName = UserRegistrationInfo.firstName;
        newUserProfile.lastName = UserRegistrationInfo.lastName;
        newUserProfile.emailAddress = UserRegistrationInfo.emailAddress;
        newUserProfile.pseudo = UserRegistrationInfo.pseudo;
        newUserProfile.password = UserRegistrationInfo.password;
        return newUserProfile;
    }
}