export interface ServerMessage{
    from:string;
    message: string;
    roomName:string;
}

export interface ClientMessage{
    clientName: string,
    message: string,
    timeStamp: string,
}