import {EntityRepository, Repository } from "typeorm";
import { ActiveUser } from "./active-users.entity";

@EntityRepository(ActiveUser)
export class ACtiveUserRepository extends Repository<ActiveUser>{
    
}