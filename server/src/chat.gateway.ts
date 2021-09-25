import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import{ServerMessage, CustomDate, ClientMessage} from'./MessageMeta'

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
  handleMessage(client: Socket, data: ClientMessage): void {
    this.logger.log("client: " + data.clientName + "sent " + data.message);
    //return {event: 'msgToClient', data: text};
    var date = new Date();
    var dateFormated : CustomDate = {
      hour: date.getHours().toString(),
      minutes: date.getMinutes.toString(),
      seconds: date.getSeconds.toString()
    };

    var metaData: ServerMessage = {
      clientName: data.clientName,
      message: data.message,
      date: dateFormated
    }
    this.wss.emit("msgToClient", metaData);
  }
}
