import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from 'src/database/database.service';
import { DrawingStatus } from 'src/enumerators/drawing-status';
import { DrawingContent } from '../drawing-content/drawing-content.entity';
import { DrawingContentRepository } from '../drawing-content/drawing-content.repository';
import { CreateDrawingDto } from './create-drawing.dto';
import { Drawing } from './drawing.entity';
import { DrawingRepository } from './drawing.repository';
import { ContentDrawingSocket, SocketDrawing } from './socket-drawing.dto';

@WebSocketGateway({namespace: '/drawing'})
export class DrawingGateway implements OnGatewayInit, OnGatewayConnection{
  
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("drawingGateway");
  private i: number = 0;
  afterInit(server: Server) {
    this.logger.log("Initialized");
  }

  constructor(@InjectRepository(DrawingContentRepository) private readonly drawingContentRepo: DrawingContentRepository,
              @InjectRepository(DrawingRepository) private readonly drawingRepo: DrawingRepository,){}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client connected: ${client.id}`);
  }

  notifyAllUsers(drawing: Drawing){
    this.logger.log(drawing.id);
    const drawingInformations = {id: drawing.id, height: drawing.height, width: drawing.width, color: drawing.bgColor};
    this.wss.emit("drawingCreated", drawingInformations);
  }

  @SubscribeMessage("drawingToServer")
  async diffuseDrawing(@MessageBody()drawing: ContentDrawingSocket){
    console.log('here');
    console.log(drawing);
    if(drawing.status === DrawingStatus.Done){
      await this.drawingContentRepo.update(drawing.contentId,{content:drawing.drawing})
    }
    if(drawing.status === DrawingStatus.Deleted){
      await this.drawingContentRepo.delete(drawing.contentId);
    }
    //let parsedDrawing:SocketDrawing = JSON.parse(drawing)
    //console.log(drawing.drawingId,drawing.contentId, drawing.drawing)
    this.wss.emit("drawingToClient", drawing);
  }

  @SubscribeMessage("createDrawingContent")
  async createContent(client: Socket, data: {drawingId: number}){
    const drawing = await this.drawingRepo.findOne(data.drawingId);
    let newContent = new DrawingContent();
    newContent.drawing = drawing;
    const newDrawing = await this.drawingContentRepo.save(newContent);
    client.emit("drawingContentCreated",{contentId: newDrawing.id});
  }
}
