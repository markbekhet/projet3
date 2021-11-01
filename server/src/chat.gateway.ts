import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import{ServerMessage, CustomDate, ClientMessage} from'./MessageMeta'
import { Team } from './modules/team/team.entity';
import { TeamRepository } from './modules/team/team.repository';
import { User } from './modules/user/user.entity';
import { UserRespository } from './modules/user/user.repository';

@WebSocketGateway({namespace:'chat',cors: true})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  
  private logger: Logger = new Logger("ChatGateway");
  
  constructor(@InjectRepository(UserRespository) private readonly userRepo: UserRespository,
    @InjectRepository(TeamRepository) private readonly teamRepo: TeamRepository){}
  @WebSocketServer() wss: Server;
  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client diconnected: ${client.id}`);
  }
  
  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    let users = await this.userRepo.find({
      select: ["id", "status", "pseudo"],
    })
    let usersRet = {userList: users}
    let usersString = JSON.stringify(usersRet);
    let teams = await this.teamRepo.find({
      select: ["id", "name","visibility"]
    })
    let teamsRet = {teamList: teams}
    let teamsString = JSON.stringify(teamsRet);
    client.emit("usersArrayToClient", usersString);
    client.emit("teamsArrayToClient", teamsString);
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
    let userString = JSON.stringify(user);
    this.wss.emit("userUpdate", userString);
  }
  notifyTeamCreation(team:Team){
    let teamString = JSON.stringify(team);
    this.wss.emit("newTeamCreated", teamString);
  }
  notifyTeamDeletion(team: Team){
    let teamString = JSON.stringify(team);
    this.wss.emit("teamDeleted", teamString);
  }
}
