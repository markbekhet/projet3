export interface JoinTeam{
    teamName: string;
    userId: string;
    password?: string;
}

export interface LeaveTeam{
    teamName: string;
    userId: string;
}