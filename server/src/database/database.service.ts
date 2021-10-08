import { HttpCode, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Status, UserCredentials, UserRegistrationInfo } from 'src/interfaces/user';
import { ConnectionHistory } from 'src/modules/connectionHistory/connectionHistory.entity';
import { ConnectionHistoryRespository } from 'src/modules/connectionHistory/connectionHistory.repository';
import { DisconnectionHistoryRespository } from 'src/modules/disconnectionHistory/disconnectionHistory.repository';
import { User } from 'src/modules/user/user.entity';
import { UserRespository } from 'src/modules/user/user.repository';

@Injectable()
export class DatabaseService {
    
    private logger: Logger = new Logger("DatabaseServiceLogger")
    constructor(
        @InjectRepository(UserRespository) private userRepo: UserRespository,
        @InjectRepository(ConnectionHistoryRespository) private connectionRepo: ConnectionHistoryRespository,
        @InjectRepository(DisconnectionHistoryRespository) private disconnectionRepo: DisconnectionHistoryRespository
        ){
            this.logger.log("Initialized");
        }
    async createUser(registrationInfo: UserRegistrationInfo){
        console.log(registrationInfo)
        let user = User.createUserProfile(registrationInfo);
        //let connection = new ConnectionHistory()
        await this.userRepo.save(user)
        //connection.user = user
        //await this.connectionRepo.save(connection)
        return user;
    }

    async getUser(userId: number) {
        let user = await this.userRepo.findOne(userId, {relations: ["connectionHistories", "disconnectionHistories"]})
        return user;
    }
    
    async login(userCredentials: UserCredentials){
        let user: User;
        user = await this.userRepo.findOne({
            where: [
                { emailAddress: userCredentials.username, password: userCredentials.password},
                {pseudo: userCredentials.username, password: userCredentials.password},
            ]
        });
        if(user !== undefined){
            if(user.status !== Status.OFFLINE){
                throw new HttpException("User already logged in", HttpStatus.FORBIDDEN);
            }
            else{
                let newConnection = new ConnectionHistory()
                newConnection.user = user;
                await this.connectionRepo.save(newConnection);
                await this.userRepo.update(user.id, {status: Status.ONLINE});
                return user.id;
            }
        }
        else{
            throw new HttpException("username or password is incorrect", HttpStatus.FORBIDDEN);
        }
    }
}
