import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateDrawingDto } from './create-drawing.dto';
import { DeleteDrawingDto } from './delete-drawing.dto';


@Controller('/drawing')
export class DrawingController {
    constructor(private readonly databaseService: DatabaseService){}

    @Post()
    async createDrawing(@Body() drawingInformation: CreateDrawingDto){
        return await this.databaseService.createDrawing(drawingInformation);
    }

    @Get("/user/:userId")
    async getUserDrawings(@Param("userId") userId: string){

    }

    @Delete()
    async deleteDrawing(@Body() deleteInformation: DeleteDrawingDto){

    }
}
