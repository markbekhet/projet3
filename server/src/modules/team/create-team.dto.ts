import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { visibility } from "src/enumerators/visibility";

export class CreateTeamDto
{
    @IsNotEmpty()
    name: string;

    @IsEnum(visibility)
    visibility:visibility;

    @IsNotEmpty()
    ownerId: string;

    @IsOptional()
    password: string;

}