import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConnexionController } from './connexion/connexion.controller';
import { ConnexionService } from './connexion/connexion.service';

@Module({
  imports: [],
  controllers: [AppController, ConnexionController],
  providers: [AppService, ConnexionService],
})
export class AppModule {}
