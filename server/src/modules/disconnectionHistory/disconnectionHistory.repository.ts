import { EntityRepository, Repository } from "typeorm";
import { DisconnectionHistory } from "./disconnectionHistory.entity";

@EntityRepository(DisconnectionHistory)
export class DisconnectionHistoryRespository extends Repository<DisconnectionHistory>{

}