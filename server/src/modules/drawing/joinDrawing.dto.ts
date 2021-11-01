export class JoinDrawingDto{
    drawingName: string;
    userId: string;
    password: string | undefined;
}
export interface LeaveDrawingDto{
    drawingName: string;
    userId: string;
}