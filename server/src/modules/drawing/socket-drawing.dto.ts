import { DrawingStatus } from "src/enumerators/drawing-status";

export interface SocketDrawing{
    drawingId: number;

    content: string[];

}

export interface ContentDrawingSocket{
    userId: string,
    drawingId: number;
    contentId: number;
    drawing: string;
    status: DrawingStatus;
}