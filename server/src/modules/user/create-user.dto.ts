import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class CreateUserDto
{
    @IsNotEmpty({message:'le prénom ne peut pas être vide'})
    @IsString({message:`Le prénom doit être une chaine de caractère`})
    firstName: string;

    @IsNotEmpty({message: 'Le nom de famille ne peut pas être vide'})
    @IsString({message: 'Le nom de famille doit etre une chaîne de caractère'})
    lastName: string;

    @IsNotEmpty({message: `Le nom d'utilisateur ne peut pas etre vide`})
    pseudo: string;

    @IsEmail()
    emailAddress: string;

    @IsNotEmpty({message:"Le mot de passe ne peut pas etre vide et il doit avoir une longueur minimal de 8 caractère"})
    @Length(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: `Le mot de passe est faible, un mot de passe doit avoir au moins un nombre, une lettre majuscule, une lettre miniscule et un caractère spéciale`})
    password: string;

}