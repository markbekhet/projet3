export class JoinDrawingDto{
  drawingId: number;
  userId: string;
  password: string | undefined;
}
export interface LeaveDrawingDto{
    drawingId: number;
    userId: string;
}
export interface JoinTeamDto{
    teamName: string;
    userId: string;
    password: string| undefined;
}

export interface LeaveTeamDto{
    teamName: string;
    userId: string;
}