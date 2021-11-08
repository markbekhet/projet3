import { IsNotEmpty } from "class-validator";

export class DeleteDrawingDto{
    @IsNotEmpty({message:`L'identifiant du dessin doit être fourni`})
    drawingId: number;

    @IsNotEmpty({message: `L'identifiant de l'utilisateur doit être fourni`})
    userId: string;
}