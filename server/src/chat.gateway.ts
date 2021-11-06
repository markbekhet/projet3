import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DrawingStatus } from './enumerators/drawing-status';
import { Status } from './enumerators/user-status';
import { DrawingVisibility, TeamVisibility } from './enumerators/visibility';
import{ClientMessage, ServerMessage} from'./MessageMeta'
import { DrawingContent } from './modules/drawing-content/drawing-content.entity';
import { DrawingContentRepository } from './modules/drawing-content/drawing-content.repository';
import { Drawing } from './modules/drawing/drawing.entity';
import { DrawingRepository } from './modules/drawing/drawing.repository';
import { JoinDrawingDto, JoinTeamDto, LeaveDrawingDto, LeaveTeamDto } from './modules/drawing/joinDrawing.dto';
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
import { ChatHistoryRepository } from './modules/chatHistory/chat-history.repository';
import { ChatHistory } from './modules/chatHistory/chat-history.entity';
import { ActiveUser } from './modules/active-users/active-users.entity';
import { ACtiveUserRepository } from './modules/active-users/active-users.repository';
import { timingSafeEqual } from 'crypto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
  
  private logger: Logger = new Logger("ChatGateway");
  @WebSocketServer() wss: Server;
  
  constructor(@InjectRepository(UserRespository) private readonly userRepo: UserRespository,
    @InjectRepository(TeamRepository) private readonly teamRepo: TeamRepository,
    @InjectRepository(DrawingContentRepository) private readonly drawingContentRepo: DrawingContentRepository,
    @InjectRepository(DrawingRepository) private readonly drawingRepo: DrawingRepository,
    @InjectRepository(DrawingEditionRepository) private readonly drawingEditionRepository: DrawingEditionRepository,
    @InjectRepository(ChatRoomRepository) private readonly chatRoomRepo: ChatRoomRepository,
    @InjectRepository(ChatHistoryRepository)private readonly chatHistoryRepo: ChatHistoryRepository,
    @InjectRepository(ACtiveUserRepository)private readonly activeUsersRepo: ACtiveUserRepository){}
  
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
    client.leave("General")
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
    let generalRoom = await this.chatRoomRepo.findOne({
      where: [{name: "General"}],
      relations: ["chatHistories"]
    });
    client.join("General");
    for(const chatContent of generalRoom.chatHistories){
      chatContent.date = new Date(chatContent.date.toString()).toLocaleString('en-Us', {timeZone:'America/New_York'});
    }
    let chatHistories = {chatHistoryList: generalRoom.chatHistories}
    let chatHistoriesString = JSON.stringify(chatHistories);
    let teamsString = JSON.stringify(teamsRet);
    client.emit("usersArrayToClient", usersString);
    client.emit("teamsArrayToClient", teamsString);
    client.emit("RoomChatHistories", chatHistoriesString);
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
    
    let drawing: Drawing = await this.drawingRepo.findOne(dtoMod.drawingId, {
      select:["visibility", "password","name", 'bgColor', 'height', 'width'],
      relations:['contents', 'activeUsers']
    });
    let passwordMatch: boolean = false
    if(drawing.visibility === DrawingVisibility.PROTECTED){
      passwordMatch = await bcrypt.compare(dtoMod.password, drawing.password);
    }
    if(passwordMatch || drawing.visibility === DrawingVisibility.PUBLIC || drawing.visibility === DrawingVisibility.PRIVATE){
      let newJoin = new ActiveUser();
      newJoin.userId = dtoMod.userId;
      newJoin.drawing = drawing;
      await this.activeUsersRepo.save(newJoin);
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
      let drawingRet = {bgColor: drawing.bgColor, name: drawing.name, width: drawing.width, height: drawing.height,
                       contents: drawing.contents, visibility: drawing.visibility};
      
      let userRet = {id: user.id, status: Status.BUSY, pseudo: user.pseudo}
      this.notifyUserUpdate(userRet);
      let chatRoom = await this.chatRoomRepo.findOne({
        where: [{name: drawingRet.name}],
        relations: ["chatHistories"],
      })
      for(const chatContent of chatRoom.chatHistories){
        chatContent.date = new Date(chatContent.date.toString()).toLocaleString('en-Us', {timeZone:'America/New_York'});
      }
      let drawingInformations = {drawing: drawingRet, chatHistoryList: chatRoom.chatHistories, activeUsers: drawing.activeUsers};
      this.wss.to(dtoMod.drawingId.toString()).emit("newJoinToDrawing", JSON.stringify({userId: dtoMod.userId}));
      client.join(dtoMod.drawingId.toString());
      // TODO: join client to the chat room
      client.join(drawingRet.name);
      client.emit("drawingInformations", JSON.stringify(drawingInformations))
      console.log(`client ${client.id} has succesfully joined ${dtoMod.drawingId}`)
    }
  }
  @SubscribeMessage("leaveDrawing")
  async leaveDrawing(client: Socket, dto: any){
    let dtoMod :LeaveDrawingDto = JSON.parse(dto)
    let user = await this.userRepo.findOne(dtoMod.userId, {
      select:['totalCollaborationTime', 'numberCollaboratedDrawings'],
      relations: ['drawingEditionHistories']
    });
    let editionHistoryDate = user.drawingEditionHistories[user.drawingEditionHistories.length-1].date.toString()
    let timeEllapsed: number = new Date().getTime() - new Date(editionHistoryDate).getTime()
    let totalCollaborationTime = timeEllapsed/(1000*60) + user.totalCollaborationTime;
    let averageCollaborationTime = totalCollaborationTime/user.numberCollaboratedDrawings
    await this.userRepo.update(dtoMod.userId, {totalCollaborationTime: totalCollaborationTime, status: Status.ONLINE, averageCollaborationTime: averageCollaborationTime})
    user = await this.userRepo.findOne(dtoMod.userId, {select: ["id", "pseudo", "status"]});
    let drawing = await this.drawingRepo.findOne(dtoMod.drawingId);
    // TODO: emit to the users who are in the room to notify them that a user has joined
    let activeUser = await this.activeUsersRepo.findOne({where:[{userId: dtoMod.userId}]});
    await this.activeUsersRepo.delete(activeUser.id);
    this.notifyUserUpdate(user);
    client.leave(drawing.name);
    client.leave(dtoMod.drawingId.toString());
    this.wss.to(dtoMod.drawingId.toString()).emit("userLeftDrawing", JSON.stringify({userId: dtoMod.userId}));
  }
  // --------------------------------------------------- team secteion ----------------------------------
  @SubscribeMessage("joinTeam")
  async joinTeam(client: Socket, dto:any){
    let data: JoinTeamDto = JSON.parse(dto);
    let team = await this.teamRepo.findOne({
      where: [{name: data.teamName}],
      select: ["id", "visibility", "password"],
      relations:["activeUsers"],
    })
    let passwordMatches: boolean = false;
    if(team.visibility === TeamVisibility.PROTECTED){
      passwordMatches = await bcrypt.compare(dto.password, team.password);
    }
    if(passwordMatches|| team.visibility === TeamVisibility.PUBLIC){
      let newJoin = new ActiveUser()
      newJoin.userId = data.userId;
      newJoin.team = team;
      await this.activeUsersRepo.save(newJoin);
      let teamGallery = await this.drawingRepo.find({
        where:[
          {visibility: DrawingVisibility.PUBLIC},
          {ownerId: team.id, visibility: DrawingVisibility.PRIVATE},
          {visibility: DrawingVisibility.PROTECTED}
        ],
        select: ["id", "visibility", "name", "bgColor", "height", "width"],
        relations:["contents"]
      })
      let gallery = {drawingsList: teamGallery};
      let chatRoom = await this.chatRoomRepo.findOne({
        where: [{name: data.teamName}],
        relations:["chatHistories"],
      })
      for(const chatContent of chatRoom.chatHistories){
        chatContent.date = new Date(chatContent.date.toString()).toLocaleString('en-Us', {timeZone:'America/New_York'});
      }
      let user = await this.userRepo.findOne(data.userId,{
        select:["numberCollaborationTeams"],
      })
      await this.userRepo.update(data.userId, {numberCollaborationTeams: user.numberCollaborationTeams + 1});
      this.wss.to(data.teamName).emit("newJoinToTeam", JSON.stringify({userId: data.userId}));
      client.join(data.teamName);
      let teamInformations = {activeUsers: team.activeUsers, chatHistoryList: chatRoom.chatHistories, gallery: gallery};
      client.emit("teamInformations", JSON.stringify(teamInformations))
    }
  }

  @SubscribeMessage("leaveTeam")
  async leaveTeam(client: Socket, dto: any){
    let data: LeaveTeamDto = JSON.parse(dto);
    let activeUser = await this.activeUsersRepo.findOne({where:[{userId: data.userId}]});
    await this.activeUsersRepo.delete(activeUser.id);
    client.leave(data.teamName);
    this.wss.to(data.teamName).emit("userLeftTeam", JSON.stringify({userId: data.userId}))
  }
  //-----------------------------------------------------messages section --------------------------------
  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, data: any){
    var dataMod: ServerMessage = JSON.parse(data)
    let chatHistory = ChatHistory.createChatHistory(dataMod);
    if(dataMod.roomName === undefined || dataMod.roomName === 'General'){
      const chatRoom = await this.chatRoomRepo.findOne({
        where: [{name: 'General'}]
      })
      chatHistory.chatRoom = chatRoom;
      const savedChatHistory = await this.chatHistoryRepo.save(chatHistory);
      savedChatHistory.date = new Date(savedChatHistory.date.toString()).toLocaleString('en-Us', {timeZone:'America/New_York'});
      let message: ClientMessage = {from:dataMod.from, message: dataMod.message, date: savedChatHistory.date, roomName: dataMod.roomName};
      this.wss.to("General").emit("msgToClient", JSON.stringify(message));
    }
    else{
      const chatRoom = await this.chatRoomRepo.findOne({
        where: [{name: dataMod.roomName}]
      })
      chatHistory.chatRoom = chatRoom;
      const savedChatHistory = await this.chatHistoryRepo.save(chatHistory);
      let message: ClientMessage = {from:dataMod.from, message: dataMod.message, date: savedChatHistory.date, roomName: dataMod.roomName};
      this.wss.to(dataMod.roomName).emit("msgToClient", JSON.stringify(message));
    }
  }
  //-------------------------------------- notifications section-------------------------------------------------
  notifyUserUpdate(user: User | {id: string, status: Status, pseudo: string}){
    let userString = JSON.stringify(user);
    this.wss.emit("userUpdate", userString);
  }
  notifyTeamCreation(team:{id: string, visibility: TeamVisibility, name: string}){
    let teamString = JSON.stringify(team);
    this.wss.emit("newTeamCreated", teamString);
  }
  notifyTeamDeletion(team: {id: string, visibility: TeamVisibility, name: string}){
    let teamString = JSON.stringify(team);
    this.wss.emit("teamDeleted", teamString);
  }
  notifyDrawingCreated(drawing: Drawing){
    // TODO:
    let drawingString = JSON.stringify(drawing);
    if(drawing.visibility!== DrawingVisibility.PRIVATE){
      this.wss.emit(drawingString);
    }
  }

}
