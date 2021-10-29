import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ChatGateway } from 'src/chat.gateway';
import { DatabaseService } from 'src/database/database.service';
import { CreateTeamDto } from './create-team.dto';
import { DeleteTeamDto } from './delete-team.dto';

@Controller('collaborationTeam')
export class CollaborationTeamController {

    constructor(private databaseService: DatabaseService, private chatGateway: ChatGateway){}
    @Post()
    async createTeam(@Body() dto: CreateTeamDto){
        let team = await this.databaseService.createTeam(dto);
        this.chatGateway.notifyTeamCreation(team);
        return team;
    }

    @Delete()
    async deleteTeam(@Body() dto: DeleteTeamDto){
        let team = await this.databaseService.deleteTeam(dto);
        this.chatGateway.notifyTeamDeletion(team);
        return HttpStatus.OK;
    }
}
