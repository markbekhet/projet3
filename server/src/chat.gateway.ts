import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import{ServerMessage, CustomDate, ClientMessage} from'./MessageMeta'
import { Team } from './modules/team/team.entity';
import { User } from './modules/user/user.entity';

@WebSocketGateway({namespace:'chat',cors: true})
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
    var formattedData: ServerMessage = JSON.parse(data)
    formattedData.date = {
        hour: ('0' + formattedData.date.hour).slice(-2),
        minutes: ('0' + formattedData.date.minutes).slice(-2),
        seconds: ('0' + formattedData.date.seconds).slice(-2)
    }
    this.logger.log("client: " + formattedData.clientName + " sent " + formattedData.message + " at" + formattedData.date.hour + ":" + formattedData.date.minutes + ":" +formattedData.date.seconds);
    //return {event: 'msgToClient', data: text}
    this.wss.emit("msgToClient", formattedData);
  }

  notifyUserUpdate(user: User){
    this.wss.emit("userUpdate", user);
  }
  notifyTeamUpdate(team:Team){

  }
}
