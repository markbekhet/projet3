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
        this.chatGateway.notifyDrawingCreated(createdDrawing);
        return createdDrawing.id;
    }

    @Get("/:drawingId/:password")
    async getDrawing(@Param("drawingId") drawingId: number, @Param("password") password: string){
        return await this.databaseService.getDrawingById(drawingId, password);
    }

    @Delete()
    async deleteDrawing(@Body() deleteInformation: DeleteDrawingDto){
        await this.databaseService.deleteDrawing(deleteInformation);
        return HttpStatus.OK;
    }
}
