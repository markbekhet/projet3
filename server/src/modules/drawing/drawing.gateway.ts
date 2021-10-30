import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DrawingStatus } from 'src/enumerators/drawing-status';
import { DrawingContent } from '../drawing-content/drawing-content.entity';
import { DrawingContentRepository } from '../drawing-content/drawing-content.repository';
import { Drawing } from './drawing.entity';
import { DrawingRepository } from './drawing.repository';
import { ContentDrawingSocket, SocketDrawing } from './socket-drawing.dto';

@WebSocketGateway({namespace: '/drawing', cors:true})
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
    const drawingInformations = {id: drawing.id, name: drawing.name};
    this.wss.emit("askJoinDrawing", drawingInformations);
  }

  @SubscribeMessage("drawingToServer")
  async diffuseDrawing(@MessageBody()drawing: any){
    console.log('here');
    console.log(drawing);
    const drawingMod: ContentDrawingSocket = JSON.parse(drawing);
    if(drawingMod.status === DrawingStatus.Done.valueOf()){
      await this.drawingContentRepo.update(drawingMod.contentId,{content:drawingMod.drawing})
    }
    if(drawingMod.status === DrawingStatus.Deleted.valueOf()){
      await this.drawingContentRepo.delete(drawingMod.contentId);
    }
    //let parsedDrawing:SocketDrawing = JSON.parse(drawing)
    //console.log(drawing.drawingId,drawing.contentId, drawing.drawing)
    this.wss.to(drawingMod.drawingName).emit("drawingToClient", drawing);
  }

  @SubscribeMessage("createDrawingContent")
  async createContent(client: Socket, data: {drawingId: number}){
    const drawing = await this.drawingRepo.findOne(data.drawingId);
    let newContent = new DrawingContent();
    newContent.drawing = drawing;
    const newDrawing = await this.drawingContentRepo.save(newContent);
    client.emit("drawingContentCreated",{contentId: newDrawing.id});
  }

  @SubscribeMessage("joinDrawing")
  async joinDrawing(client:Socket, drawingName: string){
    console.log(`client ${client.id} has joined ${drawingName}`)
    client.join(drawingName);
    let drawing: Drawing = await this.drawingRepo.findOne({
      where:[
        {name: drawingName}
      ],
      select:["bgColor","height","width","id"],
      relations:["contents"]
    });
    client.emit("drawingInformations", drawing);
  }
  @SubscribeMessage("leaveDrawing")
  leaveDrawing(client: Socket, drawingName: string){
    client.leave(drawingName);
  }
}
