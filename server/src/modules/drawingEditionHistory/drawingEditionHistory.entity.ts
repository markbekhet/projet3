import { DrawingVisibility } from "src/enumerators/visibility";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Drawing } from "../drawing/drawing.entity";
import { User } from "../user/user.entity";

@Entity("drawingEditionHistory")
export class DrawingEditionHistory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id;

    @Column()
    action: string;

    @ManyToOne(()=> User, user=> user.drawingEditionHistories)
    user:User;

    @Column()
    drawingName: string;

    @Column()
    drawingId: number;

    @Column()
    drawingVisibility: DrawingVisibility;

    @Column({type: "timestamp", default:()=> "CURRENT_TIMESTAMP"})
    date: string;
    
}