export class JoinDrawingDto{
    drawingId: number;
    userId: string;
    password: string | undefined;
}
export interface LeaveDrawingDto{
    drawingId: number;
    userId: string;
}