import { HttpCode, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status} from 'src/enumerators/user-status';
import { ConnectionHistory } from 'src/modules/connectionHistory/connectionHistory.entity';
import { ConnectionHistoryRespository } from 'src/modules/connectionHistory/connectionHistory.repository';
import { DisconnectionHistory } from 'src/modules/disconnectionHistory/disconnectionHistory.entity';
import { DisconnectionHistoryRespository } from 'src/modules/disconnectionHistory/disconnectionHistory.repository';
import { User } from 'src/modules/user/user.entity';
import { UserRespository } from 'src/modules/user/user.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/user/create-user.dto';
import { LoginDto } from 'src/modules/user/login.dto';
import { UpdateUserDto } from 'src/modules/user/update-user.dto';

@Injectable()
export class DatabaseService {
    private logger: Logger = new Logger("DatabaseServiceLogger")
    constructor(
        @InjectRepository(UserRespository) private userRepo: UserRespository,
        @InjectRepository(ConnectionHistoryRespository) private connectionRepo: ConnectionHistoryRespository,
        @InjectRepository(DisconnectionHistoryRespository) private disconnectionRepo: DisconnectionHistoryRespository,
        ){
            this.logger.log("Initialized");
        }
    async createUser(registrationInfo: CreateUserDto){
        
        console.log(registrationInfo)
        
        let user = User.createUserProfile(registrationInfo);
        let connection = new ConnectionHistory()
        await this.userRepo.save(user)
        connection.user = user
        await this.connectionRepo.save(connection)
        return user.id;
        
    }

    async getUser(userId: string) {
        
        return await this.userRepo.findOne(userId, {
            select: ["firstName", "lastName", "pseudo", "status", "emailAddress", "numberAuthoredDrawings", "numberCollaboratedDrawings",
                "totalCollaborationTime", "averageCollaborationTime", "numberCollaborationTeams"],
            relations:["connectionHistories", "disconnectionHistories"]
        })
    }
    
    async login(userCredentials: LoginDto){
        let user: User;
        user = await this.userRepo.findOne({
            where: [
                {emailAddress: userCredentials.username},
                {pseudo: userCredentials.username}
            ]
        })
        if(user === undefined){
            throw new HttpException("There is no account with this username or email", HttpStatus.BAD_REQUEST);
        }
        else{
            let userExist = await bcrypt.compare(userCredentials.password, user.password);
            if(!userExist){
                throw new HttpException("Incorrect password", HttpStatus.BAD_REQUEST);
            }
            let newConnection = new ConnectionHistory();
            newConnection.user = user;
            this.connectionRepo.save(newConnection);
            return user.id;
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
    async modifyUserProfile(userId: string, newParameters: UpdateUserDto) {
        console.log(newParameters.newPassword, newParameters.newPseudo)
        const user = await this.userRepo.findOne(userId);
        if((newParameters.newPassword === undefined|| newParameters.newPassword === null )&& newParameters.newPseudo !== undefined && newParameters.newPseudo!== null){
            await this.userRepo.update(userId,{pseudo: newParameters.newPseudo})
        }
        else if(newParameters.newPassword !== undefined  && newParameters.newPassword !== null && (newParameters.newPseudo === undefined || newParameters.newPseudo === null)){
            const validOldPassword = await bcrypt.compare(newParameters.oldPassword, user.password)
            if(!validOldPassword){
                throw new HttpException("Invalid old password and cannot change the password", HttpStatus.BAD_REQUEST);
            }
            const samePassword = await bcrypt.compare(newParameters.newPassword, user.password)
            if(samePassword){
                throw new HttpException("New password must not be similar to old password", HttpStatus.BAD_REQUEST)
            }
            if(this.IsPasswordValide(newParameters.newPassword)){
                const hashedPassword = await bcrypt.hash(newParameters.newPassword, 10)
                await this.userRepo.update(userId,{password: hashedPassword})
            }
        }
        else{
            const validOldPassword = await bcrypt.compare(newParameters.oldPassword, user.password)
            if(!validOldPassword){
                throw new HttpException("Invalid old password and cannot modify the profile", HttpStatus.BAD_REQUEST);
            }
            const samePassword = await bcrypt.compare(newParameters.newPassword, user.password)
            if(samePassword){
                throw new HttpException("New password must not be similar to old password", HttpStatus.BAD_REQUEST)
            }
            if(this.IsPasswordValide(newParameters.newPassword)){
                const hashedPassword = await bcrypt.hash(newParameters.newPassword, 10)
                await this.userRepo.update(userId,{
                    password: hashedPassword,
                    pseudo: newParameters.newPseudo
                })
        }
        }
    }
    IsPasswordValide(password: string){
        if(password.length < 8){
            throw new HttpException("The password must be longer than or equal to 8 characters", HttpStatus.BAD_REQUEST);
        }
        const FORMAT = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
        if(!FORMAT.test(password)){
            throw new HttpException("Password is too weak", HttpStatus.BAD_REQUEST);
        }

        return true;
    }
    
}
