export interface JoinDrawing{
    drawingId: number;
    userId: string;
    password: string| undefined;
}

export interface LeaveDrawing{
    drawingId: number;
    userId: string;
}