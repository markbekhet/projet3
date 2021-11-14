import { IsNotEmpty, IsString } from "class-validator";

export class DeleteTeamDto{
    @IsNotEmpty({message: `L'identifiant de l'équipe de collaboration a supprimé doit être fourni`})
    @IsString()
    teamId: string;

    @IsNotEmpty({message: `L'identifiant de l'utilisateur doit être fourni`})
    userId: string;
}