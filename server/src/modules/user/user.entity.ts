import { Status } from "src/interfaces/user";
import { BaseEntity, BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ConnectionHistory } from "../connectionHistory/connectionHistory.entity";
import { DisconnectionHistory } from "../disconnectionHistory/disconnectionHistory.entity";
import {v4 as uuidv4} from 'uuid';
import * as bcrypt from 'bcrypt';

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

    @Column({default: 0})
    nbCollaboratedDrawings: number;

    @Column({default: 0})
    nbAuthoredDrawings: number;

    @Column({
        default: Status.ONLINE
    })
    status: Status;

    @Column({
        unique: true,
    })
    pseudo: string;

    @OneToMany(()=> ConnectionHistory, connectionHistory => connectionHistory.user, {nullable:true})
    connectionHistories: ConnectionHistory[]

    @OneToMany(()=> DisconnectionHistory, disconnectionHistory => disconnectionHistory.user, {nullable: true})
    disconnectionHistories: DisconnectionHistory[]

    @BeforeInsert()
    async setPassword(){
        const salt = 10;
        this.password = await bcrypt.hash(this.password, salt)
    }
    /*@BeforeInsert()
    async setId(){
        this.id = uuidv4();
    }*/

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