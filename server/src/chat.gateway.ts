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
  handleMessage(client: Socket, data: any): void {
    var formattedData: ClientMessage = JSON.parse(data)
    this.logger.log("client: " + formattedData.clientName + " sent " + formattedData.message);
    //return {event: 'msgToClient', data: text};
    var date = new Date();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    var hour = date.getHours().toString();
    var dateFormated : CustomDate = {
      hour: hour,
      minutes: minutes,
      seconds: seconds,
    };

    var metaData: ServerMessage = {
      clientName: formattedData.clientName,
      message: formattedData.message,
      date: dateFormated
    }
    this.wss.emit("msgToClient", metaData);
  }
}
