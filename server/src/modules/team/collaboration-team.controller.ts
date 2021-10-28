import { Body, Controller, Delete, Post } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateTeamDto } from './create-team.dto';
import { DeleteTeamDto } from './delete-team.dto';

@Controller('collaborationTeam')
export class CollaborationTeamController {

    constructor(private databaseService: DatabaseService){}
    @Post()
    createTeam(@Body() dto: CreateTeamDto){
        return this.databaseService.createTeam(dto);
    }

    @Delete()
    deleteTeam(@Body() dto: DeleteTeamDto){
        this.databaseService.deleteTeam(dto);
    }
}
