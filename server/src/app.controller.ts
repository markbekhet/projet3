import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { UserRegistrationInfo } from './interfaces/user';

const LOGIN_URL = "/login";
const REGISTRATION_URL = "/register";
const PROFILE_URL = "/profile";
const DISCONNECT_URL = "/disconnect";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly databaseService: DatabaseService) {}
  // Leave this to validate that the server is deployed
  @Get("/getHello")
  getHello(): string {
    return this.appService.getHello();
  }

  @Post(REGISTRATION_URL)
  async registerUser(@Body() registrationInfo: UserRegistrationInfo){
    console.log(registrationInfo);
    debugger
    //let userInfo: UserRegistrationInfo = JSON.parse(registrationInfo);
    return await this.databaseService.createUser(registrationInfo)
  }

  @Get(PROFILE_URL+"/:userId")
  async getUserProfile(@Param("userId") userId: number){
    console.log(`Controller received ${userId} to get the user profile`)
    return await this.databaseService.getUser(userId);
  }
}
