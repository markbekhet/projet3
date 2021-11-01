import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { visibility } from "src/enumerators/visibility";

export class CreateDrawingDto{
    @IsEnum(visibility)
    visibility: visibility;

    password: string;

    @IsNotEmpty()
    ownerId: string;

    @IsNumber()
    height: number;

    @IsNumber()
    width: number;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    color: string;
}