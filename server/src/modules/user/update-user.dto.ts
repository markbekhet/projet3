import { IsOptional } from "class-validator";

export class UpdateUserDto{
    @IsOptional()
    newPassword: string;

    @IsOptional()
    newPseudo: string;

    @IsOptional()
    oldPassword: string;
}