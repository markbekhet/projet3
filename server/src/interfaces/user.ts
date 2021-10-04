export interface UserRegistrationInfo
{
    firstName: string;
    lastName: string;
    pseudo: string;
    emailAddress: string;
    password: string;
}

export enum Status{
    ONLINE,
    BUSY,
    OFFLINE,
}