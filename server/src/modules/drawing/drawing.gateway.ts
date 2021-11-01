import { Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DrawingStatus } from 'src/enumerators/drawing-status';
import { DrawingContent } from '../drawing-content/drawing-content.entity';
import { DrawingContentRepository } from '../drawing-content/drawing-content.repository';
import { DrawingEditionHistory } from '../drawingEditionHistory/drawingEditionHistory.entity';
//import { DrawingEditionHistory } from '../drawingEditionHistory/drawingEditionHistory.entity';
import { DrawingEditionRepository } from '../drawingEditionHistory/drawingEditionHistory.repository';
import { UserRespository } from '../user/user.repository';
import { Drawing } from './drawing.entity';
import { DrawingRepository } from './drawing.repository';
import { JoinDrawingDto } from './joinDrawing.dto';
import { ContentDrawingSocket, SocketDrawing } from './socket-drawing.dto';

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
    this.wss.emit("askJoinDrawing", drawingInformations);
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
  async joinDrawing(client:Socket, dto: JoinDrawingDto){
    console.log(`client ${client.id} has joined ${dto.drawingName}`)
    client.join(dto.drawingName);
    let drawing: Drawing = await this.drawingRepo.findOne({
      where:[
        {name: dto.drawingName}
      ],
      select:["bgColor","height","width","id"],
      relations:["contents"]
    });
    let user = await this.userRepo.findOne(dto.userId);
    let newEditionHistory = new DrawingEditionHistory();
    newEditionHistory.user = user;
    newEditionHistory.action = "join";
    await this.userRepo.update(user.id, {
      numberAuthoredDrawings: user.numberCollaboratedDrawings+1
    });
    await this.drawingEditionRepository.save(newEditionHistory);
    client.emit("drawingInformations", drawing);
  }
  @SubscribeMessage("leaveDrawing")
  async leaveDrawing(client: Socket, dto: JoinDrawingDto){
    let user = await this.userRepo.findOne(dto.userId, {
      select:['totalCollaborationTime'],
      relations: ['drawingEditionHistory']
    });
    let editionHistoryDate = user.drawingEditionHistories[user.drawingEditionHistories.length-1].date
    let timeEllapsed: number = new Date().getTime() - new Date(editionHistoryDate).getTime()
    let timeEllapsedInSeconds = timeEllapsed/100;
    await this.userRepo.update(dto.userId, {totalCollaborationTime: user.totalCollaborationTime + timeEllapsedInSeconds})
    //let newEditionHistory = new DrawingEditionHistory();
    //newEditionHistory.user = user;
    //newEditionHistory.action = "leave";
    //await this.drawingEditionRepository.save(newEditionHistory);
    client.leave(dto.drawingName);
  }
}
