import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRegistrationInfo } from 'src/interfaces/user';
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
        //let userInfo: UserRegistrationInfo = JSON.parse(registrationInfo);
        let user = User.createUserProfile(registrationInfo);
        let connection = new ConnectionHistory()
        await this.userRepo.save(user)
        connection.user = user
        await this.connectionRepo.save(connection)
        return user;
    }

    async getUser(userId: number) {
        let user = this.userRepo.findOne(userId, {relations: ["connectionHistories", "disconnectionHistories"]})
        return user;
      }
}
