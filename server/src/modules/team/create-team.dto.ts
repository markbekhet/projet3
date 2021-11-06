import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import {TeamVisibility } from "src/enumerators/visibility";

export class CreateTeamDto
{
    @IsNotEmpty()
    name: string;

    @IsEnum(TeamVisibility)
    visibility:TeamVisibility;

    @IsNotEmpty()
    ownerId: string;

    @IsOptional()
    password: string;

    @IsOptional()
    nbCollaborators: number;

}