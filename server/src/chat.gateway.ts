import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  
  private logger: Logger = new Logger("ChatGateway");
  
  @WebSocketServer() wss: Server;
  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client diconnected: ${client.id}`);
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log("Initialized");
  }

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): void {
    this.logger.log("client: " +client.id+ "sent " + text);
    //return {event: 'msgToClient', data: text};
    this.wss.emit("msgToClient", text);
  }
}
