import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { DrawingVisibility } from "src/enumerators/visibility";

export class CreateDrawingDto{
    @IsEnum(DrawingVisibility,{message:'La visibilité du dessin doit être privée ou publique ou protégé'})
    visibility: DrawingVisibility;

    @IsOptional()
    password: string;

    @IsNotEmpty({message: 'Le dessin doit avoir un propriétaire'})
    ownerId: string;

    @IsNotEmpty({message: 'Le dessin doit avoir une hauteur'})
    @IsNumber()
    height: number;

    @IsNotEmpty({message:'Le dessin doit avoir une largeur'})
    @IsNumber()
    width: number;

    @IsNotEmpty({message: 'Le dessin doit avoir un nom'})
    name: string;

    @IsNotEmpty({message: 'Le dessin doit avoir une couleur de fonds'})
    color: string;
}