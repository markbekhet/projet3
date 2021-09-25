import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ConnexionService {
    private usernames : string[] = [];
    public IsvalidateClient(username: string):boolean{
        if(this.usernames.length=== 0){
            this.usernames.push(username);
            return true;
        }
        var index = this.usernames.indexOf(username);
        if(index === -1){
            this.usernames.push(username);
            return true;
        }
        return false;
    }

    public diconnectClient(username: string){
        var index = this.usernames.indexOf(username);
        this.usernames.splice(index,1);
    }
}
