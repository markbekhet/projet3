import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
