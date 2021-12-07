/* eslint-disable no-console */
import { ComponentRef, Injectable } from '@angular/core';
import { ChatHistory, ClientMessage } from '@models/MessageMeta';
import { ChatComponent } from '@src/app/components/chat-component/chat.component';
// import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatRoomService {
  chatRooms = new Map<string, ChatHistory[]>();

  refs = new Map<string, ComponentRef<ChatComponent>>();

  addChatRoom(roomName: string, chatHistories: ChatHistory[]) {
    const temp: ChatHistory[] = [];
    chatHistories.forEach((chatHistory: ChatHistory) => {
      temp.push(chatHistory);
    });
    this.chatRooms.set(roomName, temp);
    console.log(this.chatRooms);
  }

  addChatHistory(message: ClientMessage) {
    console.log('here adding history');
    const chatHistories = this.chatRooms.get(message.roomName);
    if (chatHistories !== undefined) {
      const newChatHistory: ChatHistory = {
        from: message.from,
        date: message.date,
        message: message.message,
      };
      chatHistories.push(newChatHistory);
    }
    console.log(chatHistories!.length);
  }

  deleteChatRoom(roomName: string) {
    this.chatRooms.delete(roomName);
  }

  getChatHistoryList(roomName: string) {
    return this.chatRooms.get(roomName);
  }
}
