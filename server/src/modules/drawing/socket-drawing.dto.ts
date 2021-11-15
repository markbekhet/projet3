import { DrawingStatus } from "src/enumerators/drawing-status";


export interface ContentDrawingSocket{
    drawingName: string;
    userId: string,
    drawingId: number;
    id: number;
    content: string;
    status: DrawingStatus;
    toolName: string;
}