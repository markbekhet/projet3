import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ChatGateway } from 'src/chat.gateway';
import { DatabaseService } from 'src/database/database.service';
import { CreateDrawingDto } from './create-drawing.dto';
import { DeleteDrawingDto } from './delete-drawing.dto';


@Controller('/drawing')
export class DrawingController {
    constructor(private readonly databaseService: DatabaseService, private readonly chatGateway: ChatGateway){}

    @Post()
    async createDrawing(@Body() drawingInformation: CreateDrawingDto){
        let createdDrawing = await this.databaseService.createDrawing(drawingInformation);
        await this.chatGateway.notifyDrawingCreated(createdDrawing);
        return createdDrawing.id;
    }

    @Delete()
    async deleteDrawing(@Body() deleteInformation: DeleteDrawingDto){
        let drawing = await this.databaseService.deleteDrawing(deleteInformation);
        this.chatGateway.notifyDrawingDeleted(drawing);
        return HttpStatus.OK;
    }
}
