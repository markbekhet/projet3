import { Body, Controller, Delete, Post } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateTeamDto } from './create-team.dto';
import { DeleteTeamDto } from './delete-team.dto';

@Controller('collaborationTeam')
export class CollaborationTeamController {

    constructor(private databaseService: DatabaseService){}
    @Post()
    createTeam(@Body() dto: CreateTeamDto){

    }

    @Delete()
    deleteTeam(@Body() dto: DeleteTeamDto){
        
    }
}
