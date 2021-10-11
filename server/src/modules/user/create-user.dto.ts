import { IsEmail, IsNotEmpty, Length, Matches } from "class-validator";

export class CreateUserDto
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