import { IsNotEmpty } from "class-validator";

export interface SocketDrawing{
    drawingId: number;

    content: string[];

}