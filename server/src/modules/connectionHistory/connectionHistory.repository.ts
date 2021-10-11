import { EntityRepository, Repository } from "typeorm";
import { ConnectionHistory } from "./connectionHistory.entity";

@EntityRepository(ConnectionHistory)
export class ConnectionHistoryRespository extends Repository<ConnectionHistory>{

}