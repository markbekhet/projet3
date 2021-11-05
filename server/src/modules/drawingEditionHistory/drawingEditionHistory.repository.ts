import { EntityRepository, Repository } from "typeorm";
import { DrawingEditionHistory } from "./drawingEditionHistory.entity";

@EntityRepository(DrawingEditionHistory)
export class DrawingEditionRepository extends Repository<DrawingEditionHistory>{
    
}