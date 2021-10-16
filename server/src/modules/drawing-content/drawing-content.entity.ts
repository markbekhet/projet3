import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Drawing } from "../drawing/drawing.entity";

@Entity("DrawingContent")
export class DrawingContent extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true
    })
    content: string;

    @ManyToOne(()=> Drawing, drawing=>drawing.contents, {onDelete:'CASCADE'})
    drawing: Drawing;
}