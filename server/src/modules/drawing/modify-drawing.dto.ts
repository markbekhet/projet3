import { IsNotEmpty, IsOptional } from "class-validator";
import { DrawingVisibility } from "src/enumerators/visibility";

export class ModifyDrawingDto{
    @IsNotEmpty({message: `Le champ d'utilisateur ne peut pas être vide.`})
    userId: string;

    @IsNotEmpty({message: `Le champ du dessin à modifier ne peut pas être vide`})
    drawingId: number;

    @IsOptional()
    newName: string;

    @IsOptional()
    newVisibility: DrawingVisibility;

    @IsOptional()
    password: string;
}