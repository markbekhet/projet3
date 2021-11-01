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
import { ContentDrawingSocket, SocketDrawing } from './socket-drawing.dto';
import * as bcrypt from 'bcrypt';

@WebSocketGateway({namespace: '/drawing', cors:true})
export class DrawingGateway implements OnGatewayInit, OnGatewayConnection{
  
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("drawingGateway");
  private i: number = 0;
  afterInit(server: Server) {
    this.logger.log("Initialized");
  }

  constructor(@InjectRepository(DrawingContentRepository) private readonly drawingContentRepo: DrawingContentRepository,
              @InjectRepository(DrawingRepository) private readonly drawingRepo: DrawingRepository,
              @InjectRepository(DrawingEditionRepository) private readonly drawingEditionRepository: DrawingEditionRepository,
              @InjectRepository(UserRespository) private readonly userRepo: UserRespository){}

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client connected: ${client.id}`);
  }

  notifyAllUsers(drawing: Drawing){
    this.logger.log(drawing.id);
    const drawingInformations = {id: drawing.id, name: drawing.name};
    let drawingInformationsString = JSON.stringify(drawingInformations);
    this.wss.emit("askJoinDrawing", drawingInformationsString);
  }

  @SubscribeMessage("drawingToServer")
  async diffuseDrawing(@MessageBody()drawing: any){
    console.log('here');
    console.log(drawing);
    const drawingMod: ContentDrawingSocket = JSON.parse(drawing);
    if(drawingMod.status === DrawingStatus.Done.valueOf()){
      await this.drawingContentRepo.update(drawingMod.contentId,{content:drawingMod.drawing})
    }
    if(drawingMod.status === DrawingStatus.Deleted.valueOf()){
      await this.drawingContentRepo.delete(drawingMod.contentId);
    }
    this.wss.to(drawingMod.drawingName).emit("drawingToClient", drawing);
  }

  @SubscribeMessage("createDrawingContent")
  async createContent(client: Socket, data: {drawingId: number}){
    const drawing = await this.drawingRepo.findOne(data.drawingId);
    let newContent = new DrawingContent();
    newContent.drawing = drawing;
    const newDrawing = await this.drawingContentRepo.save(newContent);
    client.emit("drawingContentCreated",{contentId: newDrawing.id});
  }

  @SubscribeMessage("joinDrawing")
  async joinDrawing(client:Socket, dto: any){
    let dtoMod : JoinDrawingDto = JSON.parse(dto);
    console.log(`client ${client.id} has joined ${dtoMod.drawingName}`)
    client.join(dtoMod.drawingName);
    let drawing: Drawing = await this.drawingRepo.findOne({
      where:[
        {name: dtoMod.drawingName}
      ],
      select:["visibility", "password"],
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
        numberAuthoredDrawings: user.numberCollaboratedDrawings+1
      });
      await this.drawingEditionRepository.save(newEditionHistory);
      let drawingRet = this.drawingRepo.findOne({
        where: [{name: dtoMod.drawingName}],
        select: ['bgColor', "height", "width", "visibility"],
        relations:['contents']
      })
      let drawingString = JSON.stringify(drawingRet);
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
    await this.userRepo.update(dtoMod.userId, {totalCollaborationTime: user.totalCollaborationTime + timeEllapsedInSeconds})
    client.leave(dtoMod.drawingName);
  }
}
