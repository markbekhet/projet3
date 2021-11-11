import { IsNotEmpty, IsOptional } from "class-validator";
import { DrawingVisibility } from "src/enumerators/visibility";

export class ModifyDrawingDto{
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    drawingId: number;

    @IsOptional()
    newName: string;

    @IsOptional()
    newVisibility: DrawingVisibility;

    @IsOptional()
    password: string;
}