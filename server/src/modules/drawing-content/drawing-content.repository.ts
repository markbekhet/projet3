import { EntityRepository, Repository } from "typeorm";
import { DrawingContent } from "./drawing-content.entity";

@EntityRepository(DrawingContent)
export class DrawingContentRepository extends Repository<DrawingContent>{
    
}