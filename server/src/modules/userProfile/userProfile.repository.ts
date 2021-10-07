import { EntityRepository, Repository } from "typeorm";
import { UserProfile } from "./UserProfile.entity";


@EntityRepository(UserProfile)
export class UserProfileRespository extends Repository<UserProfile>{

}