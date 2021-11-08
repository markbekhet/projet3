import { EntityRepository, Repository } from "typeorm";
import { JoinedDrawing } from "./joined-drawings.entity";

@EntityRepository(JoinedDrawing)
export class JoinedDrawingRepository extends Repository<JoinedDrawing>{
    
}