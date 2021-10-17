import { EntityRepository, Repository } from "typeorm";
import { Drawing } from "./drawing.entity";

@EntityRepository(Drawing)
export class DrawingRepository extends Repository<Drawing>{

}