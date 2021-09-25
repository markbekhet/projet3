import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { disconnect } from 'process';
import { ConnexionService } from './connexion.service';

@Controller('/Connexion')
export class ConnexionController {
    constructor(private readonly connexionService: ConnexionService){}

    @Post("/Connect")
    validateUser(username: string){
        var valide = this.connexionService.IsvalidateClient(username);
        console.log(username + (valide)? + " has joined": "is not valid");
        if(valide){
            return HttpStatus.ACCEPTED;
        }
        throw new HttpException("A user with this username is connected", HttpStatus.FORBIDDEN);
    }

    @Post("/Disconnect")
    disonnectUser(username: string){
        this.connexionService.diconnectClient(username);
    }
}
