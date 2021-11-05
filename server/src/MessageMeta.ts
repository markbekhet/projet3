export interface ServerMessage {
  clientName: string;
  message: string;
  date: CustomDate;
}

export interface CustomDate {
  hour: string;
  minutes: string;
  seconds: string;
}

export interface ClientMessage {
  clientName: string;
  message: string;
}
