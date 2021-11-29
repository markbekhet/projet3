export interface UserRegistrationInfo {
    firstName: string;
    lastName: string;
    pseudo: string;
    emailAddress: string;
    password: string;
    avatar: string;
}

export enum Status {
    ONLINE,
    BUSY,
    OFFLINE,
}

export interface UserCredentials {
    username: string;
    password: string;
}
