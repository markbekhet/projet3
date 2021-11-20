import { Injectable } from '@angular/core';
import { ChatHistory, ClientMessage } from '@src/app/models/MessageMeta';
//import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {
  chatRooms:Map<string, ChatHistory[]> = new Map<string, ChatHistory[]>()
  
  addChatRoom(roomName: string, chatHistories: ChatHistory[]){
    this.chatRooms.set(roomName, chatHistories);
    console.log(this.chatRooms)
  }

  addChatHistory(message: ClientMessage){
    let chatHistories = this.chatRooms.get(message.roomName)
    if(chatHistories !== undefined){
      let newChatHistory: ChatHistory = {from: message.from, date: message.date, message: message.message};
      chatHistories.forEach((chatHistory: ChatHistory)=>{
        if(!(chatHistory.from === newChatHistory.from && chatHistory.date === newChatHistory.date)){
          chatHistories!.push(newChatHistory)
        }
      })
      /*if(chatHistories.indexOf(newChatHistory) === -1)
        chatHistories.push(newChatHistory);*/
    }
    console.log(chatHistories!.length);
  }

  deleteChatRoom(roomName: string){
    this.chatRooms.delete(roomName);
  }

  getChatHistoryList(roomName: string){
    console.log(this.chatRooms.get(roomName))
    return this.chatRooms.get(roomName);
  }
}
