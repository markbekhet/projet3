export interface Message{
  clientName:string;
  message: string;
  date: CustomDate;
}

export interface CustomDate{
  hour: string,
  minutes: string,
  seconds: string,
}
