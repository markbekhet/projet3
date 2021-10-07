import { Injectable } from '@nestjs/common';
import { UserRegistrationInfo } from 'src/interfaces/user';

@Injectable()
export class DatabaseService {
    constructor(){

    }
    async createUser(registrationInfo: any){
        // emailAdressUnique
        //PseudonymeUnique
    }
}
