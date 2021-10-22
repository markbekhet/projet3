import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateDrawingDto } from './create-drawing.dto';
import { DeleteDrawingDto } from './delete-drawing.dto';
import { DrawingGateway } from './drawing.gateway';


@Controller('/drawing')
export class DrawingController {
    constructor(private readonly databaseService: DatabaseService){}

    @Post()
    async createDrawing(@Body() drawingInformation: CreateDrawingDto){
        return await this.databaseService.createDrawing(drawingInformation);
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
