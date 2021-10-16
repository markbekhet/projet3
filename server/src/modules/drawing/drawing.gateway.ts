import { Logger } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateDrawingDto } from './create-drawing.dto';
import { Drawing } from './drawing.entity';
import { SocketDrawing } from './socket-drawing.dto';

@WebSocketGateway({namespace: '/drawing'})
export class DrawingGateway implements OnGatewayInit, OnGatewayConnection{
  
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("drawingGateway");

  afterInit(server: Server) {
    this.logger.log("Initialized");
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client connected: ${client.id}`);
  }

  notifyAllUsers(drawing: Drawing){
    this.logger.log(drawing.id);
    const drawingInformations = {id: drawing.id, height: drawing.height, width: drawing.width, color: drawing.bgColor};
    this.wss.emit("drawingCreated", drawingInformations);
  }

  @SubscribeMessage("drawingToServer")
  diffuseDrawing(@MessageBody()drawing: SocketDrawing){
    console.log('here');
    console.log(drawing);
    //let parsedDrawing:SocketDrawing = JSON.parse(drawing)
    console.log(drawing.drawingId,drawing.content)
    this.wss.emit("drawingToClient", drawing);
  }

}
