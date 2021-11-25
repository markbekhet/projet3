import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
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

    @IsNumber({},{message:"Le nombre de collabrateur doit être un nombre plus grand ou égale à 2"})
    nbCollaborators: number;

    @IsOptional()
    bio: string;

}