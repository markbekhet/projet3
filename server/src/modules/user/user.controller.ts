import { Controller, Get, HttpStatus, Param, Post, Put, Body, HttpException } from '@nestjs/common';
import { ChatGateway } from 'src/chat.gateway';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto } from './update-user.dto';

const PROFILE_URL = "/profile";
const DISCONNECT_URL = "/disconnect";

@Controller('/user')
export class UserController {
    constructor(private readonly databaseService: DatabaseService, private chatGateway: ChatGateway){}

    @Get(PROFILE_URL+"/:userId/:visitedId")
        async getUserProfile(@Param("userId") userId: string, @Param("visitedId") visitedId: string){
        console.log(`Controller received ${userId} wants to get the profile of ${visitedId}`)
        return await this.databaseService.getUser(userId, visitedId);
    }

    
    @Post(DISCONNECT_URL+"/:userId")
    async disconnectUser(@Param("userId") userId: string){
        let user = await this.databaseService.disconnect(userId);
        this.chatGateway.notifyUserUpdate(user);
        return HttpStatus.OK
    }

    @Put(PROFILE_URL+ "/:userId")
    async modifyProfile(@Param("userId") userId: string, @Body() newParameters: UpdateUserDto){
        let user = await this.databaseService.modifyUserProfile(userId, newParameters);
        this.chatGateway.notifyUserUpdate(user);
        return HttpStatus.OK
    }
    
    @Get("/gallery/:userId")
    async getUserGallery(@Param("userId") userId: string){
        return await this.databaseService.getUserDrawings(userId);
    }
}
