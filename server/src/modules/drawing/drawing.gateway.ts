import {Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DrawingStatus } from 'src/enumerators/drawing-status';
import { visibility } from 'src/enumerators/visibility';
import { DrawingContent } from '../drawing-content/drawing-content.entity';
import { DrawingContentRepository } from '../drawing-content/drawing-content.repository';
import { DrawingEditionHistory } from '../drawingEditionHistory/drawingEditionHistory.entity';
//import { DrawingEditionHistory } from '../drawingEditionHistory/drawingEditionHistory.entity';
import { DrawingEditionRepository } from '../drawingEditionHistory/drawingEditionHistory.repository';
import { UserRespository } from '../user/user.repository';
import { Drawing } from './drawing.entity';
import { DrawingRepository } from './drawing.repository';
import { JoinDrawingDto, LeaveDrawingDto } from './joinDrawing.dto';
import { ContentDrawingSocket} from './socket-drawing.dto';
import * as bcrypt from 'bcrypt';
import { ChatGateway } from 'src/chat.gateway';
import { Status } from 'src/enumerators/user-status';

@WebSocketGateway({namespace: '/drawing', cors:true})
export class DrawingGateway implements OnGatewayInit, OnGatewayConnection{
  
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("drawingGateway");
  afterInit(server: Server) {
    this.logger.log("Initialized");
  }

  constructor(@InjectRepository(DrawingContentRepository) private readonly drawingContentRepo: DrawingContentRepository,
              @InjectRepository(DrawingRepository) private readonly drawingRepo: DrawingRepository,
              @InjectRepository(DrawingEditionRepository) private readonly drawingEditionRepository: DrawingEditionRepository,
              @InjectRepository(UserRespository) private readonly userRepo: UserRespository, private chatGateway: ChatGateway){}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client connected: ${client.id}`);
  }

  notifyAllUsers(drawing: Drawing){
    this.logger.log(drawing.id);
    const drawingInformations = {id: drawing.id};
    let drawingInformationsString = JSON.stringify(drawingInformations);
    this.wss.emit("askJoinDrawing", drawingInformationsString);
  }

  @SubscribeMessage("drawingToServer")
  async diffuseDrawing(@MessageBody()drawing: any){
    console.log('here');
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
    let dataMod: {drawingId: number}= JSON.parse(data)
    const drawing = await this.drawingRepo.findOne(dataMod.drawingId);
    let newContent = new DrawingContent();
    newContent.drawing = drawing;
    const newDrawing = await this.drawingContentRepo.save(newContent);
    let contentRet = {contentId: newDrawing.id};
    let contentIdString = JSON.stringify(contentRet)
    client.emit("drawingContentCreated",contentIdString);
  }

  @SubscribeMessage("joinDrawing")
  async joinDrawing(client:Socket, dto: any){
    let dtoMod : JoinDrawingDto = JSON.parse(dto);
    console.log(`client ${client.id} has joined ${dtoMod.drawingId}`)
    
    let drawing: Drawing = await this.drawingRepo.findOne({
      where:[
        {id: dtoMod.drawingId}
      ],
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
        numberAuthoredDrawings: user.numberCollaboratedDrawings+1,
        status: Status.BUSY,
      });
      newEditionHistory.drawingName = drawing.name;
      await this.drawingEditionRepository.save(newEditionHistory);
      let drawingRet = this.drawingRepo.findOne({
        where: [{id: dtoMod.drawingId}],
        select: ['bgColor', "height", "width", "visibility", "name"],
        relations:['contents']
      })
      const userRet = await this.userRepo.findOne(dtoMod.userId,{
        select: ["id", "status", "pseudo"]
      })
      this.chatGateway.notifyUserUpdate(userRet);
      let drawingString = JSON.stringify(drawingRet);
      client.join(dtoMod.drawingId.toString());
      client.emit("drawingInformations", drawingString);
    }
  }
  @SubscribeMessage("leaveDrawing")
  async leaveDrawing(client: Socket, dto: any){
    let dtoMod :LeaveDrawingDto = JSON.parse(dto)
    let user = await this.userRepo.findOne(dtoMod.userId, {
      select:['totalCollaborationTime'],
      relations: ['drawingEditionHistory']
    });
    let editionHistoryDate = user.drawingEditionHistories[user.drawingEditionHistories.length-1].date.toString()
    let timeEllapsed: number = new Date().getTime() - new Date(editionHistoryDate).getTime()
    let timeEllapsedInSeconds = timeEllapsed/1000;
    await this.userRepo.update(dtoMod.userId, {totalCollaborationTime: user.totalCollaborationTime + timeEllapsedInSeconds, status: Status.ONLINE})
    user = await this.userRepo.findOne(dtoMod.userId, {select: ["id", "pseudo", "status"]});
    this.chatGateway.notifyUserUpdate(user);
    client.leave(dtoMod.drawingId.toString());
  }
}