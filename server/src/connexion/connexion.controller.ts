import { Controller, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { disconnect } from 'process';
import { ConnexionService } from './connexion.service';

@Controller('/connexion')
export class ConnexionController {
    constructor(private readonly connexionService: ConnexionService){}

    @Post("/connect/:username")
    validateUser(@Param('username') username:string){
        var valide = this.connexionService.IsvalidateClient(username);
        var verdict:string = (valide)? "has joined": "is not valid";
        console.log(`${username} ${verdict}`);
        if(valide){
            return HttpStatus.ACCEPTED;
        }
        throw new HttpException("A user with this username is connected", HttpStatus.FORBIDDEN);
    }

    @Post("/disconnect/:username")
    disonnectUser(@Param('username') username: string){
        this.connexionService.diconnectClient(username);
    }
}
