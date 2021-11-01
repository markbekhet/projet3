import { DrawingStatus } from "src/enumerators/drawing-status";


export interface ContentDrawingSocket{
    drawingName: string;
    userId: string,
    drawingId: number;
    contentId: number;
    drawing: string;
    status: DrawingStatus;
    toolName: string;
}