import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionController } from './connection/connection.controller';
import { ConnectionService } from './connection/connection.service';
import { ChatGateway } from './chat.gateway';
import { DatabaseService } from './database/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dirname } from 'path/posix';
import { typeormConfigDevDB } from './config/typeorm.config.dev';
import { UserRespository } from './modules/user/user.repository';
import { ConnectionHistoryRespository } from './modules/connectionHistory/connectionHistory.repository';
import { DisconnectionHistoryRespository } from './modules/disconnectionHistory/disconnectionHistory.repository';
import { UserController } from './modules/user/user.controller';
import { DrawingRepository } from './modules/drawing/drawing.repository';
import { DrawingController } from './modules/drawing/drawing.controller';
import { DrawingGateway } from './modules/drawing/drawing.gateway';
import { DrawingContentRepository } from './modules/drawing-content/drawing-content.repository';
import { CollaborationTeamController } from './modules/team/collaboration-team.controller';
import { TeamRepository } from './modules/team/team.repository';
import { DrawingEditionRepository } from './modules/drawingEditionHistory/drawingEditionHistory.repository';
import { typeormConfigProdDB } from './config/typeorm.config.prod';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfigDevDB),
    TypeOrmModule.forFeature([
      UserRespository,
      ConnectionHistoryRespository,
      DisconnectionHistoryRespository,
      DrawingRepository,
      DrawingContentRepository,
      TeamRepository,
      DrawingEditionRepository,
    ])
  ],
  controllers: [AppController, ConnectionController, UserController, DrawingController, CollaborationTeamController],
  providers: [AppService, ConnectionService, ChatGateway, DatabaseService, DrawingGateway],
})
export class AppModule {}
