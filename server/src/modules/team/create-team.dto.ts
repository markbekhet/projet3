import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import {TeamVisibility } from "src/enumerators/visibility";

export class CreateTeamDto
{
    @IsNotEmpty({message:'Une équipe de collabration doit avoir un nom'})
    name: string;

    @IsEnum(TeamVisibility, {message:`La visibilité d'une équipe de collabration doit être publique ou protgée`})
    visibility:TeamVisibility;

    @IsNotEmpty({message:'Une équipe de collaboration doit avoir un propriétaire'})
    ownerId: string;

    @IsOptional()
    password: string;

    @IsOptional()
    nbCollaborators: number;

}