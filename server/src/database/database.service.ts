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
import { DrawingRepository } from 'src/modules/drawing/drawing.repository';
import { CreateDrawingDto } from 'src/modules/drawing/create-drawing.dto';
import { DrawingVisibility, TeamVisibility } from 'src/enumerators/visibility';
import { Drawing } from 'src/modules/drawing/drawing.entity';
import { DeleteDrawingDto } from 'src/modules/drawing/delete-drawing.dto';
import { TeamRepository } from 'src/modules/team/team.repository';
import { CreateTeamDto } from 'src/modules/team/create-team.dto';
import { Team } from 'src/modules/team/team.entity';
import { DeleteTeamDto } from 'src/modules/team/delete-team.dto';
import { DrawingEditionRepository } from 'src/modules/drawingEditionHistory/drawingEditionHistory.repository';
import { FindManyOptions } from 'typeorm';
import { DrawingEditionHistory } from 'src/modules/drawingEditionHistory/drawingEditionHistory.entity';
import { DrawingState } from 'src/enumerators/drawing-state';

@Injectable()
export class DatabaseService {
    private logger: Logger = new Logger("DatabaseServiceLogger")
    constructor(
        @InjectRepository(UserRespository) private userRepo: UserRespository,
        @InjectRepository(ConnectionHistoryRespository) private connectionRepo: ConnectionHistoryRespository,
        @InjectRepository(DisconnectionHistoryRespository) private disconnectionRepo: DisconnectionHistoryRespository,
        @InjectRepository(DrawingRepository) private drawingRepo: DrawingRepository,
        @InjectRepository(TeamRepository) private teamRepo: TeamRepository,
        @InjectRepository(DrawingEditionRepository) private drawingEditionRepo: DrawingEditionRepository,
        ){
            this.logger.log("Initialized");
        }
        //-------------------------------------------------- User services ---------------------------------------------------------------------
    async createUser(registrationInfo: CreateUserDto){
        
        console.log(registrationInfo)
        
        let user = User.createUserProfile(registrationInfo);
        let connection = new ConnectionHistory()
        await this.userRepo.save(user)
        connection.user = user
        await this.connectionRepo.save(connection)
        let returnedUser = await this.userRepo.findOne(user.id,{
            select: ["status","id","pseudo"],
        })
        console.log(connection.date)
        let date = connection.date.toString();
        console.log(date);
        return returnedUser;
        
    }

    async getUser(userId: string, visitedId) {
        if(userId === visitedId){
            let user =  await this.userRepo.findOne(userId, {
                select: ["firstName", "lastName", "pseudo", "status", "emailAddress", "numberAuthoredDrawings", "numberCollaboratedDrawings",
                    "totalCollaborationTime", "averageCollaborationTime", "numberCollaborationTeams"],
                relations:["connectionHistories", "disconnectionHistories", "drawingEditionHistories"]
            })
            for(const connection of user.connectionHistories){
                connection.date = new Date(connection.date.toString()).toLocaleString('en-US', {timeZone:'America/New_York'});
            }
            for(const disconnect of user.disconnectionHistories){
                disconnect.date = new Date(disconnect.date.toString()).toLocaleString('en-US', {timeZone:'America/New_York'});
            }
            for(const drawingEdition of user.drawingEditionHistories){
                drawingEdition.date = new Date(drawingEdition.date.toString()).toLocaleString('en-US', {timeZone:'America/New_York'});
            }
            return user;
        }
        else{
            console.log('here');
            let user =  await this.userRepo.findOne(visitedId,{
                select:["id", "pseudo", "status"]
            })
            console.log(user);
            return user;
        }
    }
    
    async login(userCredentials: LoginDto){
        let user: User;
        user = await this.userRepo.findOne({
            where: [
                {emailAddress: userCredentials.username},
                {pseudo: userCredentials.username}
            ],
            select: ["id","password", "status"],
        })
        if(user === undefined){
            throw new HttpException("There is no account with this username or email", HttpStatus.BAD_REQUEST);
        }
        else{
            
            if(user.status == Status.ONLINE || user.status == Status.BUSY){
                throw new HttpException("User is already logged in", HttpStatus.BAD_REQUEST);
            }
            let userExist = await bcrypt.compare(userCredentials.password, user.password);
            if(!userExist){
                throw new HttpException("Incorrect password", HttpStatus.BAD_REQUEST);
            }
            
            await this.userRepo.update(user.id, {
                status: Status.ONLINE
            })
            let newConnection = new ConnectionHistory();
            newConnection.user = user;
            this.connectionRepo.save(newConnection);
            let userRet = await this.userRepo.findOne({
                where: [
                    {emailAddress: userCredentials.username},
                    {pseudo: userCredentials.username}
                ],
                select:["id", "status", "pseudo"],
            })
            return userRet;
        }
    }

    async disconnect(userId: number) {
        const user = await this.userRepo.findOne({
            where: [
                {id: userId}
            ],
            select: ["id","pseudo","status"]
        })
        if(user === undefined){
            throw new HttpException("There is no user with this id", HttpStatus.BAD_REQUEST);
        }
        else{
            const newDisconnection = new DisconnectionHistory()
            newDisconnection.user = user
            this.userRepo.update(userId, {status: Status.OFFLINE})
            this.disconnectionRepo.save(newDisconnection)
            user.status = Status.OFFLINE;
            return user;
        }
    }
    async modifyUserProfile(userId: string, newParameters: UpdateUserDto) {
        console.log(newParameters.newPassword, newParameters.newPseudo)
        const user = await this.userRepo.findOne(userId, {
            select:["pseudo","password"]
        });
        if(user === undefined){
            throw new HttpException("There is no user with this id", HttpStatus.BAD_REQUEST);
        }
        else{
            if((newParameters.newPassword === undefined|| newParameters.newPassword === null )&& newParameters.newPseudo !== undefined && newParameters.newPseudo!== null){
                await this.userRepo.update(userId,{pseudo: newParameters.newPseudo})
                user.pseudo = newParameters.newPseudo;
            }
            else if(newParameters.newPassword !== undefined  && newParameters.newPassword !== null && (newParameters.newPseudo === undefined || newParameters.newPseudo === null)){
                if(newParameters.oldPassword == undefined || newParameters.oldPassword == null){
                    throw new HttpException("Old password required", HttpStatus.BAD_REQUEST);
                }
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
                if(newParameters.oldPassword == undefined || newParameters.oldPassword == null){
                    throw new HttpException("Old password required", HttpStatus.BAD_REQUEST);
                }
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
                user.pseudo = newParameters.newPseudo;
            }
            let retuser = this.userRepo.findOne(userId, {
                select:["id", "pseudo", "status"]
            })
            return retuser;

        }
    }
    async getUserDrawings(userId: string){
        const drawings = await this.drawingRepo.find({
            where: [
                {visibility: DrawingVisibility.PUBLIC},
                {ownerId: userId, visibility:DrawingVisibility.PRIVATE},
                {visibility: DrawingVisibility.PROTECTED},
            ],
            select: ["id", "visibility", "name", "bgColor"],
            relations:["contents"],
        })
        return {drawingList:drawings};
    }
    /*async getGallery(drawings: Drawing[]){
        let drawingCollection: GalleryDrawing[] = []
        for(const drawing of drawings){
            let username: string = null;
            let firstName: string = null;
            let lastName: string = null;
            let email: string = null;
            // to change with collaboration team
            const user = await this.userRepo.findOne(drawing.ownerId);
            username = user.pseudo;
            const galleryDrawing: GalleryDrawing = {drawingId: drawing.id, visibility: drawing.visibility, drawingName: drawing.name,
                                        ownerUsername: username, height: drawing.height, width: drawing.width, ownerEmail: email, ownerFirstName: firstName,
                                        ownerLastName: lastName, contents: drawing.contents}
            if(drawingCollection.indexOf(galleryDrawing) === -1){
                drawingCollection.push(galleryDrawing);
            }
        };
        console.log(drawingCollection)
        return drawingCollection;

    }*/
    //------------------------------------------------Drawing services----------------------------------------------------------------------------------------
    async createDrawing(drawingInformation: CreateDrawingDto){
        const user = await this.userRepo.findOne(drawingInformation.ownerId);
        if(user!== undefined){
            await this.userRepo.update(user.id, {
                numberAuthoredDrawings: user.numberAuthoredDrawings + 1,
            })
        }
        if(drawingInformation.visibility === DrawingVisibility.PROTECTED){
            if(drawingInformation.password === undefined || drawingInformation.password === null){
                throw new HttpException("Password required", HttpStatus.BAD_REQUEST)
            } 
        }
        const drawing = Drawing.createDrawing(drawingInformation);
        const newDrawing = await this.drawingRepo.save(drawing);
        const retDrawing = await this.drawingRepo.findOne(newDrawing.id, {
            select:["id", "visibility"],
            relations:["contents"]
        })
        return retDrawing;
    }
    async getDrawingById(drawingId: number, password: string){
        const drawing = await this.drawingRepo.findOne(drawingId,{relations:["contents"]});
        if(drawing.visibility === DrawingVisibility.PROTECTED){
            const passwordMatch = await bcrypt.compare(password, drawing.password);
            if(!passwordMatch){
                throw new HttpException("Incorrect password", HttpStatus.BAD_REQUEST);
            }
        }
        return drawing;
    }
    async deleteDrawing(deleteInformation: DeleteDrawingDto){
        const drawing = await this.drawingRepo.findOne(deleteInformation.drawingId,{
            select:["id", "ownerId"],
            relations:["activeUsers"],
        });
        if(drawing.ownerId !== deleteInformation.userId){
            throw new HttpException("User is not allowed to delete this drawing", HttpStatus.BAD_REQUEST);
        }
        if(drawing.activeUsers.length === 0){
            await this.drawingRepo.delete(drawing.id)
            let editionHistories = await this.drawingEditionRepo.find({where: [{drawingId: deleteInformation.drawingId}]});
            for(const editionHistory of editionHistories){
                await this.drawingEditionRepo.update(editionHistory.id, {drawingStae: DrawingState.DELETED});
            }
        }
        else{
            throw new HttpException("can not delete drawing because there is a user editing this drawing", HttpStatus.BAD_REQUEST);
        }
    }
    // ----------------------------------------Team services--------------------------------------------------------------------------------------------------
    async createTeam(dto: CreateTeamDto){
        if(dto.visibility === TeamVisibility.PROTECTED){
            if(dto.password=== undefined || dto.password === null){
                throw new HttpException("Password required", HttpStatus.BAD_REQUEST);
            }
        }
        const newTeam = Team.createTeam(dto);
        const createdTeam = await this.teamRepo.save(newTeam)
        /*let returnedTeam = await this.teamRepo.findOne(createdTeam.id, {
            select: ["id", "visibility", "name"],
        })*/
        let returnedTeam = {id:createdTeam.id, visibility: dto.visibility, name: dto.name};
        return returnedTeam;
    }

    async deleteTeam(dto: DeleteTeamDto){
        const drawings = await this.drawingRepo.find({
            where: [{ownerId: dto.teamId}],
            relations:["activeUsers"]
        })
        const team = await this.teamRepo.findOne(dto.teamId,{
            select: ["ownerId","id","visibility","name"],
            relations: ["activeUsers"],
        });
        if(team.ownerId !== dto.userId){
            throw new HttpException("User is not allowed to delete this team", HttpStatus.BAD_REQUEST);
        }
        if(team.activeUsers.length > 0){
            throw new HttpException("can not delete the collaboration team because some users are in the collaboration team", HttpStatus.BAD_REQUEST);
        }
        for(const drawing of drawings){
            if(drawing.activeUsers.length > 0){
                throw new HttpException("can not delete the collaboration team because there is a user editing a drawing associated to this team", HttpStatus.BAD_REQUEST);
            }
            await this.drawingRepo.delete(drawing.id);
            let editionHistories = await this.drawingEditionRepo.find({where: [{drawingId: drawing.id}]});
            for(const editionHistory of editionHistories){
                await this.drawingEditionRepo.update(editionHistory.id, {drawingStae: DrawingState.DELETED});
            }
        }
        await this.teamRepo.delete(dto.teamId);
        let retTeam = {id: dto.teamId, visibility: team.visibility, name: team.name};
        return retTeam;
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------
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
