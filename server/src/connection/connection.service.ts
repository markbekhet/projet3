import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionService {
    private static usernames : string[] = [];
    public IsvalidateClient(username: string):boolean{
        console.log(username)
        if(ConnectionService.usernames.length=== 0){
            ConnectionService.usernames.push(username);
            return true;
        }
        var index = ConnectionService.usernames.indexOf(username);
        if(index === -1){
            ConnectionService.usernames.push(username);
            return true;
        }
        return false;
    }

    public diconnectClient(username: string){
        var index = ConnectionService.usernames.indexOf(username);
        if(index !== -1){
            ConnectionService.usernames.splice(index,1);
            console.log(`There is ${ConnectionService.usernames.length} clients connected to the server`);
            console.log(`${username} has left`);
            console.log(`The users connected are ${ConnectionService.usernames}`)
        }
    }
}
