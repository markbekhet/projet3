import { visibility } from "src/enumerators/visibility";
import { BaseEntity, Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("drawing")
export class Drawing extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP"
    })
    creationDate: string;

    @Column()
    ownerId: string;

    @Column()
    visibility: visibility;

    @Column({
        nullable: true
    })
    password: string;

    @Column()
    height: number;

    @Column()
    width: number;

    @Column()
    name: string;

    @Column({ nullable: true})
    content: string;

}