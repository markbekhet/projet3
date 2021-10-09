import { Contains, IsEmail, IsEmpty, IsNotEmpty, Length, Matches, NotContains } from "class-validator";

export class UserRegistrationInfo
{
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    pseudo: string;

    @IsEmail()
    emailAddress: string;

    @IsNotEmpty()
    @Length(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    password: string;

}

export enum Status{
    ONLINE,
    BUSY,
    OFFLINE,
}
export class UserCredentials{
    @IsNotEmpty()
    username: string;
    @IsNotEmpty()
    password: string;
}

export class ModificationParameters{
    newPassword: string;

    newPseudo: string;
}