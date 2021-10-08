import { HttpCode, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { identity } from 'rxjs';
import { ModificationParameters, Status, UserCredentials, UserRegistrationInfo } from 'src/interfaces/user';
import { ConnectionHistory } from 'src/modules/connectionHistory/connectionHistory.entity';
import { ConnectionHistoryRespository } from 'src/modules/connectionHistory/connectionHistory.repository';
import { DisconnectionHistory } from 'src/modules/disconnectionHistory/disconnectionHistory.entity';
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
            if(user.status === Status.OFFLINE){
                let newConnection = new ConnectionHistory()
                newConnection.user = user;
                await this.connectionRepo.save(newConnection);
                await this.userRepo.update(user.id, {status: Status.ONLINE});
                return user.id;
            }
            else{
                throw new HttpException("User already logged in", HttpStatus.FORBIDDEN);
            }
        }
        else{
            throw new HttpException("username or password is incorrect", HttpStatus.FORBIDDEN);
        }
    }

    async disconnect(userId: number) {
        const user = await this.userRepo.findOne({
            where: [
                {id: userId}
            ]
        })
        if(user !== undefined){
            const newDisconnection = new DisconnectionHistory()
            newDisconnection.user = user
            this.userRepo.update(userId, {status: Status.OFFLINE})
            this.disconnectionRepo.save(newDisconnection)
        }
    }
    async modifyUserProfile(userId: number, newParameters: ModificationParameters) {
        console.log(newParameters.newPassword, newParameters.newPseudo)
        
        if((newParameters.newPassword === undefined|| newParameters.newPassword === null )&& newParameters.newPseudo !== undefined && newParameters.newPseudo!== null){
            this.userRepo.update(userId,{pseudo: newParameters.newPseudo})
        }
        else if(newParameters.newPassword !== undefined  && newParameters.newPassword !== null && (newParameters.newPseudo === undefined || newParameters.newPseudo === null)){
            this.userRepo.update(userId,{password: newParameters.newPassword})
        }
        else{
            this.userRepo.update(userId,{
                password: newParameters.newPassword,
                pseudo: newParameters.newPseudo
            })
        }
    }
}
