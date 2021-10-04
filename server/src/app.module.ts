import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionController } from './connection/connection.controller';
import { ConnectionService } from './connection/connection.service';
import { ChatGateway } from './chat.gateway';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [],
  controllers: [AppController, ConnectionController],
  providers: [AppService, ConnectionService, ChatGateway, DatabaseService],
})
export class AppModule {}
