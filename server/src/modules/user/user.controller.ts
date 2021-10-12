import { Controller, Get, HttpStatus, Param, Post, Put, Body, HttpException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UpdateUserDto } from './update-user.dto';

const PROFILE_URL = "/profile";
const DISCONNECT_URL = "/disconnect";

@Controller('/user')
export class UserController {
    constructor(private readonly databaseService: DatabaseService){}

    @Get(PROFILE_URL+"/:userId")
        async getUserProfile(@Param("userId") userId: string){
        console.log(`Controller received ${userId} to get the user profile`)
        return await this.databaseService.getUser(userId);
    }

    
    @Post(DISCONNECT_URL+"/:userId")
    async disconnectUser(@Param("userId") userId: number){
        await this.databaseService.disconnect(userId);
        return HttpStatus.OK
    }

    @Put(PROFILE_URL+ "/:userId")
    async modifyProfile(@Param("userId") userId: string, @Body() newParameters: UpdateUserDto){
        try{
            await this.databaseService.modifyUserProfile(userId, newParameters);
            return HttpStatus.OK
        }
        catch(e: any){
            throw new HttpException("Username already used", HttpStatus.BAD_REQUEST);
        }
    }
}
