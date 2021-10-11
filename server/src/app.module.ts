import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionController } from './connection/connection.controller';
import { ConnectionService } from './connection/connection.service';
import { ChatGateway } from './chat.gateway';
import { DatabaseService } from './database/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dirname } from 'path/posix';
import { typeormConfig } from './config/typeorm.config';
import { UserRespository } from './modules/user/user.repository';
import { ConnectionHistoryRespository } from './modules/connectionHistory/connectionHistory.repository';
import { DisconnectionHistoryRespository } from './modules/disconnectionHistory/disconnectionHistory.repository';
import { UserController } from './modules/user/user.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    TypeOrmModule.forFeature([
      UserRespository,
      ConnectionHistoryRespository,
      DisconnectionHistoryRespository,
    ])
  ],
  controllers: [AppController, ConnectionController, UserController],
  providers: [AppService, ConnectionService, ChatGateway, DatabaseService],
})
export class AppModule {}
