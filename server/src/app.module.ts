import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnectionController } from './connection/connection.controller';
import { ConnectionService } from './connection/connection.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [],
  controllers: [AppController, ConnectionController],
  providers: [AppService, ConnectionService, ChatGateway],
})
export class AppModule {}
