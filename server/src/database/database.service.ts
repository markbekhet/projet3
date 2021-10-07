import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRegistrationInfo } from 'src/interfaces/user';
import { UserProfile } from 'src/modules/userProfile/UserProfile.entity';
import { UserProfileRespository } from 'src/modules/userProfile/userProfile.repository';

@Injectable()
export class DatabaseService {
    private logger: Logger = new Logger("DatabaseServiceLogger")
    constructor(
        @InjectRepository(UserProfileRespository) private userRepo: UserProfileRespository
        ){
            this.logger.log("Initialized");
        }
    async createUser(registrationInfo: UserRegistrationInfo){
        console.log(registrationInfo)
        //let userInfo: UserRegistrationInfo = JSON.parse(registrationInfo);
        let userProfile = UserProfile.createUserProfile(registrationInfo);
        return await this.userRepo.save(userProfile)
    }
}
