import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DrawingStatus } from './enumerators/drawing-status';
import { Status } from './enumerators/user-status';
import { visibility } from './enumerators/visibility';
import{ServerMessage, CustomDate, ClientMessage} from'./MessageMeta'
import { DrawingContent } from './modules/drawing-content/drawing-content.entity';
import { DrawingContentRepository } from './modules/drawing-content/drawing-content.repository';
import { Drawing } from './modules/drawing/drawing.entity';
import { DrawingRepository } from './modules/drawing/drawing.repository';
import { JoinDrawingDto, LeaveDrawingDto } from './modules/drawing/joinDrawing.dto';
import { ContentDrawingSocket } from './modules/drawing/socket-drawing.dto';
import { DrawingEditionHistory } from './modules/drawingEditionHistory/drawingEditionHistory.entity';
import { DrawingEditionRepository } from './modules/drawingEditionHistory/drawingEditionHistory.repository';
import { Team } from './modules/team/team.entity';
import { TeamRepository } from './modules/team/team.repository';
import { User } from './modules/user/user.entity';
import { UserRespository } from './modules/user/user.repository';
import * as bcrypt from 'bcrypt';
import { ChatRoomRepository } from './modules/chatRoom/chat-room.repository';
import { ChatRoom } from './modules/chatRoom/chat-room.entity';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  
  private logger: Logger = new Logger("ChatGateway");
  @WebSocketServer() wss: Server;
  
  constructor(@InjectRepository(UserRespository) private readonly userRepo: UserRespository,
    @InjectRepository(TeamRepository) private readonly teamRepo: TeamRepository,
    @InjectRepository(DrawingContentRepository) private readonly drawingContentRepo: DrawingContentRepository,
    @InjectRepository(DrawingRepository) private readonly drawingRepo: DrawingRepository,
    @InjectRepository(DrawingEditionRepository) private readonly drawingEditionRepository: DrawingEditionRepository,
    @InjectRepository(ChatRoomRepository) private readonly chatRoomRepo: ChatRoomRepository){}
  
  async afterInit(server: Server) {
    try{
      this.logger.log("Initialized");
      let newChatRoom = new ChatRoom();
      newChatRoom.name = "General";
      await this.chatRoomRepo.save(newChatRoom);
      this.logger.log("executed");
    } catch(error){
      this.logger.log(error.message)
    };
  }
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
  //---------------------------------------------------- drawing section --------------------------------
  @SubscribeMessage("drawingToServer")
  async handleDrawing(@MessageBody()drawing:any){
    console.log(drawing);
    const drawingMod: ContentDrawingSocket = JSON.parse(drawing);
    if(drawingMod.status === DrawingStatus.Done.valueOf()){
      await this.drawingContentRepo.update(drawingMod.id,{content:drawingMod.content, toolName:drawingMod.toolName})
    }
    if(drawingMod.status === DrawingStatus.Deleted.valueOf()){
      await this.drawingContentRepo.delete(drawingMod.id);
    }
    this.wss.to(drawingMod.drawingId.toString()).emit("drawingToClient", drawing);
  }

  @SubscribeMessage("createDrawingContent")
  async createContent(client: Socket, data: any){
    //{drawingId: number}
    const dataMod: {drawingId: number} = JSON.parse(data);
    console.log(dataMod);
    const drawing = await this.drawingRepo.findOne(dataMod.drawingId);
    let newContent = new DrawingContent();
    newContent.drawing = drawing;
    const newDrawing = await this.drawingContentRepo.save(newContent);
    let contentRet = {contentId: newDrawing.id};
    let contentIdString = JSON.stringify(contentRet);
    client.emit("drawingContentCreated",contentIdString);
  }

  @SubscribeMessage("joinDrawing")
  async joinDrawing(client:Socket, dto: any){
    let dtoMod : JoinDrawingDto = JSON.parse(dto);
    console.log(`client ${client.id} has joined ${dtoMod.drawingId}`)
    
    let drawing: Drawing = await this.drawingRepo.findOne(dtoMod.drawingId, {
      select:["visibility", "password","name"],
    });
    let passwordMatch: boolean = false
    if(drawing.visibility === visibility.PROTECTED){
      passwordMatch = await bcrypt.compare(dtoMod.password, drawing.password);
    }
    if(passwordMatch || drawing.visibility === visibility.PUBLIC || drawing.visibility === visibility.PRIVATE){
      let user = await this.userRepo.findOne(dtoMod.userId);
      let newEditionHistory = new DrawingEditionHistory();
      newEditionHistory.user = user;
      newEditionHistory.action = "join";
      await this.userRepo.update(user.id, {
        numberCollaboratedDrawings: user.numberCollaboratedDrawings+1,
        status: Status.BUSY,
      });
      newEditionHistory.drawingName = drawing.name;
      newEditionHistory.drawingVisibility = drawing.visibility;
      newEditionHistory.drawingId = dtoMod.drawingId;
      await this.drawingEditionRepository.save(newEditionHistory);
      let drawingRet = await this.drawingRepo.findOne(dtoMod.drawingId, {
        select: ['bgColor', "height", "width", "visibility", "name"],
        relations:['contents']
      })
      const userRet = await this.userRepo.findOne(dtoMod.userId,{
        select: ["id", "status", "pseudo"]
      })
      this.notifyUserUpdate(userRet);
      let drawingString = JSON.stringify(drawingRet);
      client.join(dtoMod.drawingId.toString());
      // TODO: join client to the chat room
      // TODO: emit all the chat history when done 
      client.emit("drawingInformations", drawingString);
    }
  }
  @SubscribeMessage("leaveDrawing")
  async leaveDrawing(client: Socket, dto: any){
    let dtoMod :LeaveDrawingDto = JSON.parse(dto)
    let user = await this.userRepo.findOne(dtoMod.userId, {
      select:['totalCollaborationTime'],
      relations: ['drawingEditionHistories']
    });
    let editionHistoryDate = user.drawingEditionHistories[user.drawingEditionHistories.length-1].date.toString()
    let timeEllapsed: number = new Date().getTime() - new Date(editionHistoryDate).getTime()
    let timeEllapsedInSeconds = timeEllapsed/1000;
    await this.userRepo.update(dtoMod.userId, {totalCollaborationTime: user.totalCollaborationTime + timeEllapsedInSeconds, status: Status.ONLINE})
    user = await this.userRepo.findOne(dtoMod.userId, {select: ["id", "pseudo", "status"]});
    this.notifyUserUpdate(user);
    client.leave(dtoMod.drawingId.toString());
  }

  //-----------------------------------------------------messages section --------------------------------
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
  //-------------------------------------- notifications section-------------------------------------------------
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
  notifyDrawingCreated(drawing: Drawing){
    // TODO:
    let drawingString = JSON.stringify(drawing);
    if(drawing.visibility!== visibility.PRIVATE){
      this.wss.emit(drawingString);
    }
  }

}
