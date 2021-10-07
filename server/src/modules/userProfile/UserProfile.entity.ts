import { Status } from "src/interfaces/user";
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
//import * as uuidv4from "uuid";
//import * as bcrypt from 'bcryptjs';

@Entity('UserProfile')
export class UserProfile extends BaseEntity{
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
    //@Column()
    //connectionHistory: Date[]

    //@Column()
    //disconnectionHistory: Date[]
    public static createUserProfile(UserRegistrationInfo):UserProfile{
        let newUserProfile = new UserProfile();
        newUserProfile.firstName = UserRegistrationInfo.firstName;
        newUserProfile.lastName = UserRegistrationInfo.lastName;
        newUserProfile.emailAddress = UserRegistrationInfo.emailAddress;
        newUserProfile.pseudo = UserRegistrationInfo.pseudo;
        newUserProfile.password = UserRegistrationInfo.password;
        return newUserProfile;
    }
}