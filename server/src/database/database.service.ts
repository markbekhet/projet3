import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRegistrationInfo } from 'src/interfaces/user';
import { User } from 'src/modules/user/user.entity';
import { UserRespository } from 'src/modules/user/user.repository';

@Injectable()
export class DatabaseService {
    private logger: Logger = new Logger("DatabaseServiceLogger")
    constructor(
        @InjectRepository(UserRespository) private userRepo: UserRespository
        ){
            this.logger.log("Initialized");
        }
    async createUser(registrationInfo: UserRegistrationInfo){
        console.log(registrationInfo)
        //let userInfo: UserRegistrationInfo = JSON.parse(registrationInfo);
        let userProfile = User.createUserProfile(registrationInfo);
        return await this.userRepo.save(userProfile)
    }
}
