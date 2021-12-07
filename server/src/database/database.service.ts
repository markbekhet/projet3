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
import { DrawingState } from 'src/enumerators/drawing-state';
import { ChatRoomRepository } from 'src/modules/chatRoom/chat-room.repository';
import { ModifyDrawingDto } from 'src/modules/drawing/modify-drawing.dto';
import { DrawingGallery } from 'src/modules/drawing/gallery';
import { ChatGateway } from 'src/chat.gateway';

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
        @InjectRepository(ChatRoomRepository) private chatRoomRepo: ChatRoomRepository,
        private readonly chatGateway: ChatGateway
        ){
            this.logger.log("Initialized");
        }
        //-------------------------------------------------- User services ---------------------------------------------------------------------
    async createUser(registrationInfo: CreateUserDto){

        console.log(registrationInfo)
        let otherUser = await this.userRepo.findOne({where:[{emailAddress: registrationInfo.emailAddress}]})
        if(otherUser!== undefined){
            throw new HttpException("Il existe un compte avec cette addresse courriel", HttpStatus.BAD_REQUEST);
        }
        else if(otherUser=== undefined){
            otherUser = await this.userRepo.findOne({where:[{pseudo: registrationInfo.pseudo}]})
            if(otherUser !== undefined){
                throw new HttpException("Le nom d'utilisateur est déjà utilisé", HttpStatus.BAD_REQUEST);
            }
        }
        let user = User.createUserProfile(registrationInfo);
        let connection = new ConnectionHistory()
        const savedUser = await this.userRepo.save(user)
        connection.user = user
        await this.connectionRepo.save(connection)
        let returnedUser = {id: savedUser.id, status:Status.ONLINE, pseudo: registrationInfo.pseudo, avatar: savedUser.avatar};
        console.log(connection.date)
        let date = connection.date.toString();
        console.log(date);
        return returnedUser;

    }

    async getUser(userId: string, visitedId: string) {
        if(userId === visitedId){
            let user =  await this.userRepo.findOne(userId, {
                select: ["firstName", "lastName", "pseudo", "status", "emailAddress", "numberAuthoredDrawings", "numberCollaboratedDrawings",
                    "totalCollaborationTime", "averageCollaborationTime", "numberCollaborationTeams"],
                relations:["connectionHistories", "disconnectionHistories", "drawingEditionHistories"]
            })
            for(let connection of user.connectionHistories){
                connection.date = new Date(connection.date.toString()).toLocaleString('en-US', {timeZone:'America/New_York'});
            }
            for(let disconnect of user.disconnectionHistories){
                disconnect.date = new Date(disconnect.date.toString()).toLocaleString('en-US', {timeZone:'America/New_York'});
            }
            for(let drawingEdition of user.drawingEditionHistories){
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
            select: ["id","password", "status", "pseudo", 'avatar'],
        })
        if(user === undefined){
            throw new HttpException("Aucun compte existe avec un tel courriel ou nom d'utilisateur", HttpStatus.BAD_REQUEST);
        }
        else{

            if(user.status == Status.ONLINE || user.status == Status.BUSY){
                throw new HttpException("Cet utilisateur est déjà connecté à l'application", HttpStatus.BAD_REQUEST);
            }
            let userExist = await bcrypt.compare(userCredentials.password, user.password);
            if(!userExist){
                throw new HttpException("Le mot de passe est invalide", HttpStatus.BAD_REQUEST);
            }

            await this.userRepo.update(user.id, {
                status: Status.ONLINE
            })
            let newConnection = new ConnectionHistory();
            newConnection.user = user;
            this.connectionRepo.save(newConnection);
            let userRet = {id: user.id, status: Status.ONLINE, pseudo: user.pseudo, avatar: user.avatar};
            return userRet;
        }
    }

    async disconnect(userId: string) {
        const user = await this.userRepo.findOne({
            where: [
                {id: userId}
            ],
            select: ["id","pseudo","status", 'avatar']
        })
        if(user === undefined){
            throw new HttpException("Il n'existe aucun utilisateur avec cet identifiant", HttpStatus.BAD_REQUEST);
        }
        else{
            const newDisconnection = new DisconnectionHistory()
            newDisconnection.user = user
            this.userRepo.update(userId, {status: Status.OFFLINE})
            this.disconnectionRepo.save(newDisconnection)
            let userRet = {id: user.id, pseudo: user.pseudo, status: Status.OFFLINE, avatar: user.avatar}
            return userRet;
        }
    }

    async passwordVerification(currentPassword: string, oldPassword: string , newPassword: string){
        if(oldPassword === undefined || oldPassword === null){
            throw new HttpException("L'ancien mot de passe est requis", HttpStatus.BAD_REQUEST);
        }
        const validOldPassword = await bcrypt.compare(oldPassword, currentPassword)
        if(!validOldPassword){
            throw new HttpException("Impossible de changer le mot de passe car l'ancien mot de passe est invalide", HttpStatus.BAD_REQUEST);
        }
        const samePassword = await bcrypt.compare(newPassword, currentPassword)
        if(samePassword){
            throw new HttpException("le nouveau mot de passe ne peut pas être similaire à l'ancien mot de passe", HttpStatus.BAD_REQUEST)
        }
        if(!this.IsPasswordValide(newPassword)){
            throw new HttpException(`le nouveau mot de passe est faible, un mot de passe doit avoir une longueur 8 caractères 
            et ça doit être composé d'au moins: une lettre majuscule, une lettre minuscule, un chiffre et un caractère spéciale`, HttpStatus.BAD_REQUEST);
        }

        else{
            return await bcrypt.hash(newPassword, 10)
        }
    }

    async modifyUserProfile(userId: string, newParameters: UpdateUserDto) {
        console.log(newParameters.newPassword, newParameters.newPseudo)
        let user = await this.userRepo.findOne(userId, {
            select:["pseudo","password", 'status', 'id', 'avatar']
        });
        if(user === undefined){
            throw new HttpException("Il n'existe aucun utilisateur avec cet identifiant", HttpStatus.BAD_REQUEST);
        }
        else{
            let updatePassword: Boolean = newParameters.newPassword !== undefined&& newParameters.newPassword !== null
            let updatePseudo: boolean = newParameters.newPseudo !== undefined && newParameters.newPseudo!== null
            let updateAvatar: boolean = newParameters.newAvatar !== undefined && newParameters.newAvatar!== null
            if(!updateAvatar){
                if(!updatePseudo && !updatePassword){
                    throw new HttpException("Impossible de mettre a jour les informations de l'utilisateur", HttpStatus.BAD_REQUEST);
                }
                if(updatePseudo){
                    const otherUser = await this.userRepo.findOne({where:[{pseudo: newParameters.newPseudo}]});
                    if(otherUser!== undefined){
                        throw new HttpException("Impossible de modifier les paramètres de l'utilisateur, le nouveau pseudonyme est déjà utilisé", HttpStatus.BAD_REQUEST)
                    }
                }
                if(!updatePassword&& updatePseudo){
                    console.log("before update")
                    await this.userRepo.update(userId,{pseudo: newParameters.newPseudo})
                    console.log("after update")
                    user.pseudo = newParameters.newPseudo;
                }
                else if(updatePassword && !updatePseudo){
                    const hashedPassword = await this.passwordVerification(user.password, newParameters.oldPassword, newParameters.newPassword);
                    await this.userRepo.update(userId, {password: hashedPassword});
                }

                else if(updatePseudo && updatePassword){
                    const hashedPassword = await this.passwordVerification(user.password, newParameters.oldPassword, newParameters.newPassword);
                    await this.userRepo.update(userId,{
                        password: hashedPassword,
                        pseudo: newParameters.newPseudo
                    })
                    user.pseudo = newParameters.newPseudo;
                }
            }
            else{
                if(!updatePassword && !updatePseudo){
                    await this.userRepo.update(userId, {avatar: newParameters.newAvatar})
                }
                if(!updatePassword&& updatePseudo){
                    await this.userRepo.update(userId,{pseudo: newParameters.newPseudo, avatar: newParameters.newAvatar})
                    console.log("after update")
                    user.pseudo = newParameters.newPseudo;
                }
                else if(updatePassword && !updatePseudo){
                    const hashedPassword = await this.passwordVerification(user.password, newParameters.oldPassword, newParameters.newPassword);
                    await this.userRepo.update(userId, {password: hashedPassword, avatar: newParameters.newAvatar});
                }
    
                else if(updatePseudo && updatePassword){
                    const hashedPassword = await this.passwordVerification(user.password, newParameters.oldPassword, newParameters.newPassword);
                    await this.userRepo.update(userId,{
                        password: hashedPassword,
                        pseudo: newParameters.newPseudo,
                        avatar: newParameters.newAvatar,
                    })
                    user.pseudo = newParameters.newPseudo;
                }
                user.avatar = newParameters.newAvatar
            }
            let retUser: {id: string, pseudo:string, status: Status, avatar: string};
            retUser = {id: user.id, pseudo: user.pseudo, status: user.status, avatar: user.avatar}
            console.log("user information were successfully updated");
            return retUser;
        }
    }
    async getUserDrawings(userId: string){
        let drawings = await this.drawingRepo.find({
            where: [
                {visibility: DrawingVisibility.PUBLIC},
                {ownerId: userId, visibility:DrawingVisibility.PRIVATE},
                {visibility: DrawingVisibility.PROTECTED},
            ],
            select: ["id", "visibility", "name", "bgColor", "height", "width", "ownerId","creationDate"],
            relations:["contents", "activeUsers"],
        })

        let userGallery: DrawingGallery[] = [];
        for(let drawing of drawings){
            drawing.creationDate = new Date(drawing.creationDate.toString()).toLocaleString('en-us', {timeZone:'America/New_York'})
            let user = await this.userRepo.findOne(drawing.ownerId);
            if(user === undefined){
                let team = await this.teamRepo.findOne(drawing.ownerId);
                if(team!== undefined){
                    let galleryDrawing : DrawingGallery = {id: drawing.id, visibility: drawing.visibility, name: drawing.name,
                        creationDate: drawing.creationDate, authorName: team.name, height: drawing.height, width: drawing.width,
                        ownerId: drawing.ownerId, bgColor: drawing.bgColor, nbCollaborators: drawing.activeUsers.length, contents: drawing.contents}
                        userGallery.push(galleryDrawing);
                    }
            }
            else{
                let galleryDrawing : DrawingGallery = {id: drawing.id, visibility: drawing.visibility, name: drawing.name,
                    creationDate: drawing.creationDate, authorName: user.pseudo, height: drawing.height, width: drawing.width,
                    ownerId: drawing.ownerId, bgColor: drawing.bgColor, nbCollaborators: drawing.activeUsers.length, contents: drawing.contents}
                userGallery.push(galleryDrawing);
            }
        }
        return {drawingList:userGallery};
    }
    //------------------------------------------------Drawing services----------------------------------------------------------------------------------------
    async createDrawing(drawingInformation: CreateDrawingDto){
        const chatRoom = await this.chatRoomRepo.findOne({where:[{name: drawingInformation.name}]})
        if(chatRoom!==undefined){
            throw new HttpException("Impossible de créer le dessin, le nom du dessin est déjà utilisé", HttpStatus.BAD_REQUEST);
        }
        const user = await this.userRepo.findOne(drawingInformation.ownerId);
        if(user!== undefined){
            await this.userRepo.update(user.id, {
                numberAuthoredDrawings: user.numberAuthoredDrawings + 1,
            })
        }
        if(drawingInformation.visibility === DrawingVisibility.PROTECTED){
            if(drawingInformation.password === undefined || drawingInformation.password === null){
                throw new HttpException("Le mot de passe est requis pour créer un dessin protégé", HttpStatus.BAD_REQUEST)
            }
        }
        else if(drawingInformation.password === undefined){
            drawingInformation.password = null;
        }
        let ownerName: string = '';
        if(user!== undefined){
            ownerName = user.pseudo;
        }
        else{
            let team = await this.teamRepo.findOne(drawingInformation.ownerId);
            ownerName = team.name
        }
        const drawing = Drawing.createDrawing(drawingInformation);
        const newDrawing = await this.drawingRepo.save(drawing);
        newDrawing.creationDate = new Date(newDrawing.creationDate.toString()).toLocaleString('en-us', {timeZone: "America/New_York"})
        const retDrawing: DrawingGallery = {id: newDrawing.id, visibility: drawing.visibility, name: drawing.name,
                             bgColor: drawing.bgColor, height: drawing.height, width: drawing.width, contents: [],
                              ownerId: drawing.ownerId, creationDate:newDrawing.creationDate, nbCollaborators: 0, authorName: ownerName};
        return retDrawing;
    }
    async deleteDrawing(deleteInformation: DeleteDrawingDto){
        const drawing = await this.drawingRepo.findOne(deleteInformation.drawingId,{
            relations:["activeUsers", "chatRoom"],
        });
        if(drawing.ownerId !== deleteInformation.userId){
            let team = await this.teamRepo.findOne(drawing.ownerId);
            if(team === undefined || team === null || team.ownerId !== drawing.ownerId){
                throw new HttpException("Impossible de supprimer le dessin car vous n'en êtes pas le propriétaire", HttpStatus.BAD_REQUEST);
            }
        }

        if(drawing.activeUsers.length > 0){
            throw new HttpException("Impossible de supprimer le dessin, car il est en cours d'édition", HttpStatus.BAD_REQUEST);
        }
        await this.drawingRepo.delete(drawing.id)
        let editionHistories = await this.drawingEditionRepo.find({where: [{drawingId: deleteInformation.drawingId}]});
        for(const editionHistory of editionHistories){
            await this.drawingEditionRepo.update(editionHistory.id, {drawingStae: DrawingState.DELETED});
        }
        await this.chatRoomRepo.delete(drawing.chatRoom.id);
        let retDrawing = {id: deleteInformation.drawingId, ownerId: drawing.ownerId, visibility: drawing.visibility};
        return retDrawing;

    }

    async modifyDrawing(dto: ModifyDrawingDto){
        let otherChatRoom = await this.chatRoomRepo.findOne({where:[{name: dto.newName}]})
        if(otherChatRoom!== undefined){
            throw new HttpException("Impossible de modifier le dessin, le nouveau nom du dessin est déjà utilisé dans l'application", HttpStatus.BAD_REQUEST);
        }
        let drawing = await this.drawingRepo.findOne(dto.drawingId, {relations: ["contents", "activeUsers"]});
        // validating that the user is allowed to modify the drawing
        if(drawing.activeUsers.length > 0){
            throw new HttpException("Impossible de modifier le dessin parce qu'il est en cours d'édition par d'autres utilisateurs", HttpStatus.BAD_REQUEST)
        }
        let ownerName: string = ''
        let user = await this.userRepo.findOne(drawing.ownerId);
        if(user === undefined){
            let team = await this.teamRepo.findOne(drawing.ownerId);
            ownerName = team.name;
        }
        else{
            ownerName = user.pseudo;
        }
        let chatRoom = await this.chatRoomRepo.findOne({
            where: [{name: drawing.name}]
        })

        let editionHistories = await this.drawingEditionRepo.find({
            where: [{drawingId: dto.drawingId}]
        })
        if(drawing.ownerId !== dto.userId){
            let team = await this.teamRepo.findOne(drawing.ownerId);
            if(team === undefined || team === null || team.ownerId !== drawing.ownerId){
                throw new HttpException(`Impossible de faire la modification du dessin, car vous n'êtes pas le propriétaire`, HttpStatus.BAD_REQUEST);
            }
        }
        // validating that the password exist if the new visibility is protected
        if(dto.newVisibility === DrawingVisibility.PROTECTED && (dto.password === undefined || dto.password === null)){
            throw new HttpException("Le mot de passe est requis pour changer la visibilité de dessin à la visibilité protégé", HttpStatus.BAD_REQUEST);
        }
        let updateName: boolean = dto.newName!== undefined && dto.newName !== null
        let updateVisibility: boolean = dto.newVisibility !== undefined && dto.newVisibility !== null;
        if(updateName && !updateVisibility){
            await this.chatRoomRepo.update(chatRoom.id, {name: dto.newName})
            if(editionHistories !== undefined){
                for(let editionHistory of editionHistories){
                    await this.drawingEditionRepo.update(editionHistory.id, {drawingName: dto.newName});
                }
            }
            await this.drawingRepo.update(dto.drawingId, {name: dto.newName});
        }
        else if(!updateName && updateVisibility){
            let hashedPassword = null;
            if(dto.newVisibility === DrawingVisibility.PROTECTED)
                hashedPassword = await bcrypt.hash(dto.password, 10)
            await this.drawingRepo.update(dto.drawingId, {visibility: dto.newVisibility, password: hashedPassword});
            if(editionHistories !== undefined){
                for(let editionHistory of editionHistories){
                    await this.drawingEditionRepo.update(editionHistory.id, {drawingVisibility: dto.newVisibility});
                }
            }
        }
        else if(updateName && updateVisibility){
            await this.chatRoomRepo.update(chatRoom.id, {name: dto.newName})
            if(editionHistories!== undefined){
                for(let editionHistory of editionHistories){
                    await this.drawingEditionRepo.update(editionHistory.id, {drawingName: dto.newName, drawingVisibility: dto.newVisibility});
                }
            }
            let hashedPassword = null;
            if(dto.newVisibility === DrawingVisibility.PROTECTED)
                hashedPassword = await bcrypt.hash(dto.password, 10)
            await this.drawingRepo.update(dto.drawingId, {name: dto.newName, visibility: dto.newVisibility, password: hashedPassword});
        }
        if(updateVisibility){
            drawing.visibility = dto.newVisibility;
        }
        if(updateName){
            drawing.name = dto.newName;
        }
        drawing.creationDate = new Date(drawing.creationDate.toString()).toLocaleString('en-us', {timeZone: "America/New_York"})
        let drawingMod: DrawingGallery = {id: dto.drawingId, visibility: drawing.visibility, name: drawing.name,
             bgColor: drawing.bgColor, height: drawing.height, width: drawing.width, contents: drawing.contents,
            ownerId: drawing.ownerId, nbCollaborators: drawing.activeUsers.length, authorName: ownerName, creationDate: drawing.creationDate};
        return drawingMod;
    }

    // ----------------------------------------Team services--------------------------------------------------------------------------------------------------
    async createTeam(dto: CreateTeamDto){
        let chatRoom = await this.chatRoomRepo.findOne({where:[{name: dto.name}]});
        if(chatRoom !== undefined){
            throw new HttpException("Impossible de créer le nouveau équipe de collaboration, le nom de l'équipe est déjà utilisé", HttpStatus.BAD_REQUEST)
        }
        if(dto.visibility === TeamVisibility.PROTECTED){
            if(dto.password=== undefined || dto.password === null){
                throw new HttpException("Le mot de passe est requis pour créer une équipe de collaboration protégée", HttpStatus.BAD_REQUEST);
            }
        }
        else if(dto.password === undefined && dto.visibility === TeamVisibility.PUBLIC){
            dto.password = null;
        }
        const newTeam = Team.createTeam(dto);
        const createdTeam = await this.teamRepo.save(newTeam)
        let returnedTeam = {id:createdTeam.id, visibility: dto.visibility, name: dto.name, ownerId: dto.ownerId, bio: dto.bio};
        return returnedTeam;
    }

    async deleteTeam(dto: DeleteTeamDto){
        const drawings = await this.drawingRepo.find({
            where: [{ownerId: dto.teamId}],
            relations:["activeUsers", "chatRoom"]
        })
        const team = await this.teamRepo.findOne(dto.teamId,{
            select: ["ownerId","id","visibility","name"],
            relations: ["activeUsers", "chatRoom"],
        });
        if(team.ownerId !== dto.userId){
            throw new HttpException("Impossible de supprimer cette équipe de collabration car vous n'en êtes pas le propriétaire", HttpStatus.BAD_REQUEST);
        }
        if(team.activeUsers.length > 0){
            throw new HttpException("Impossible de supprimer cette équipe de collaboration car il y a des utilisateurs dans cette équipe de collaboration", HttpStatus.BAD_REQUEST);
        }
        let drawingOccupied: boolean = false
        for(const drawing of drawings){
            if(drawing.activeUsers.length > 0){
                drawingOccupied = true;
            }
            else{
                await this.drawingRepo.delete(drawing.id);
                this.chatGateway.notifyDrawingDeleted({id: drawing.id, ownerId:drawing.ownerId, visibility: drawing.visibility })
                await this.chatRoomRepo.delete(drawing.chatRoom.id);
                let editionHistories = await this.drawingEditionRepo.find({where: [{drawingId: drawing.id}]});
                for(const editionHistory of editionHistories){
                    await this.drawingEditionRepo.update(editionHistory.id, {drawingStae: DrawingState.DELETED});
                }
            }
        }
        if(drawingOccupied){
            throw new HttpException("Impossible de supprimer l'équipe de collaboration car il y a au moins un dessin en cours d'édition dont l'équipe de collaboration est propriétaire", HttpStatus.BAD_REQUEST);
        }
        await this.teamRepo.delete(dto.teamId);
        await this.chatRoomRepo.delete(team.chatRoom.id);
        let retTeam = {id: dto.teamId, visibility: team.visibility, name: team.name};
        return retTeam;
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------
    IsPasswordValide(password: string){
        if(password.length < 8){
            return false;
        }
        const FORMAT = new RegExp(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/);
        if(!FORMAT.test(password)){
            return false;
        }

        return true;
    }
}
