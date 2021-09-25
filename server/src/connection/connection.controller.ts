import { Controller, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { disconnect } from 'process';
import { ConnectionService } from './connection.service';

@Controller('/connection')
export class ConnectionController {
    constructor(private readonly connectionService: ConnectionService){}

    @Post("/connect/:username")
    validateUser(@Param('username') username:string){
        var valide = this.connectionService.IsvalidateClient(username);
        var verdict:string = (valide)? "has joined": "is not valid";
        console.log(`${username} ${verdict}`);
        if(valide){
            return HttpStatus.ACCEPTED;
        }
        throw new HttpException("A user with this username is connected", HttpStatus.FORBIDDEN);
    }

    @Post("/disconnect/:username")
    disonnectUser(@Param('username') username: string){
        this.connectionService.diconnectClient(username);
    }
}
