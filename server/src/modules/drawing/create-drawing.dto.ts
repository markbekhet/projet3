import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { DrawingVisibility } from "src/enumerators/visibility";

export class CreateDrawingDto{
    @IsEnum(DrawingVisibility)
    visibility: DrawingVisibility;

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