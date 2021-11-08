import { EntityRepository, Repository } from "typeorm";
import { JoinedTeam } from "./joined-teams.entity";

@EntityRepository(JoinedTeam)
export class JoinedTeamRepository extends Repository<JoinedTeam>{
    
}