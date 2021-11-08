import { IsNotEmpty } from "class-validator";

export class LoginDto{
    @IsNotEmpty({message: "Le nom d'utilisateur ou le courriel ne peut pas être vide"})
    username: string;
    @IsNotEmpty({message: "Le mot de passe ne peut pas être vide"})
    password: string;
}