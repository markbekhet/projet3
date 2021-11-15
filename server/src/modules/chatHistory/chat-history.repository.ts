import { EntityRepository, Repository } from "typeorm";
import { ChatHistory } from "./chat-history.entity";

@EntityRepository(ChatHistory)
export class ChatHistoryRepository extends Repository<ChatHistory>{}