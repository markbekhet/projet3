import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import "reflect-metadata";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //app.useStaticAssets(join(__dirname, '..', 'Client_test'));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
