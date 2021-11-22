import { DrawingState } from "src/enumerators/drawing-state";
import { DrawingVisibility } from "src/enumerators/visibility";
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Drawing } from "../drawing/drawing.entity";
import { User } from "../user/user.entity";

@Entity("drawingEditionHistory")
export class DrawingEditionHistory extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    action: string;

    @Index()
    @ManyToOne(()=> User, user=> user.drawingEditionHistories, {onDelete:'CASCADE'})
    user:User;

    @Column()
    drawingName: string;

    @Column()
    drawingId: number;

    @Column()
    drawingVisibility: DrawingVisibility;

    @Column(({default: DrawingState.AVAILABLE}))
    drawingStae: DrawingState;

    @Column({type: "timestamp", default:()=> "CURRENT_TIMESTAMP"})
    date: string;
    
}