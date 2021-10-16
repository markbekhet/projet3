import { Logger } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from 'src/database/database.service';
import { CreateDrawingDto } from './create-drawing.dto';
import { Drawing } from './drawing.entity';
import { ContentDrawingSocket, SocketDrawing } from './socket-drawing.dto';

@WebSocketGateway({namespace: '/drawing'})
export class DrawingGateway implements OnGatewayInit, OnGatewayConnection{
  
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("drawingGateway");
  private i: number = 0;
  afterInit(server: Server) {
    this.logger.log("Initialized");
  }

  constructor(private readonly databaseService: DatabaseService){}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client connected: ${client.id}`);
  }

  notifyAllUsers(drawing: Drawing){
    this.logger.log(drawing.id);
    const drawingInformations = {id: drawing.id, height: drawing.height, width: drawing.width, color: drawing.bgColor};
    this.wss.emit("drawingCreated", drawingInformations);
  }

  @SubscribeMessage("drawingToServer")
  diffuseDrawing(@MessageBody()drawing: ContentDrawingSocket){
    console.log('here');
    console.log(drawing);
    //let parsedDrawing:SocketDrawing = JSON.parse(drawing)
    //console.log(drawing.drawingId,drawing.contentId, drawing.drawing)
    this.wss.emit("drawingToClient", drawing);
  }

  @SubscribeMessage("createDrawingContent")
  createContent(client: Socket, drawing: {drawingId: number}){
    this.i++;
    client.emit("drawingContentCreated",{contentId: this.i});
  }
}
