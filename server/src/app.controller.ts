import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ChatGateway } from './chat.gateway';
import { DatabaseService } from './database/database.service';
import { CreateUserDto } from './modules/user/create-user.dto';
import { LoginDto } from './modules/user/login.dto';
import { UpdateUserDto } from './modules/user/update-user.dto';

const LOGIN_URL = '/login';
const REGISTRATION_URL = '/register';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseService: DatabaseService,
    private chatGateway: ChatGateway,
  ) {}
  // Leave this to validate that the server is deployed
  @Get('/getHello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Post(REGISTRATION_URL)
  async registerUser(@Body() registrationInfo: CreateUserDto) {
    console.log(registrationInfo);
    debugger;
    //let userInfo: UserRegistrationInfo = JSON.parse(registrationInfo);
    try {
      const user = await this.databaseService.createUser(registrationInfo);
      this.chatGateway.notifyUserUpdate(user);
      return user.id;
    } catch (ex) {
      throw new HttpException(ex.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(LOGIN_URL)
  async login(@Body() userCredentials: LoginDto) {
    const user = await this.databaseService.login(userCredentials);
    this.chatGateway.notifyUserUpdate(user);
    return user.id;
  }
}
