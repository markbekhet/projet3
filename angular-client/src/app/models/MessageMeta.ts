export interface ServerMessage {
  from: string;
  message: string;
  roomName: string;
}

export interface ClientMessage {
  from: string;
  message: string;
  date: string;
  roomName: string;
}

export interface ChatHistory {
  id: number;
  from: string;
  date: string;
  message: string;
}
