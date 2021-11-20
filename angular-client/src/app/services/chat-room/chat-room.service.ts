import { Injectable } from '@angular/core';
import { ChatHistory } from '@src/app/models/MessageMeta';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService {
  chatRooms: BehaviorSubject<Map<string, ChatHistory[]>> = new BehaviorSubject<Map<string, ChatHistory[]>>(new Map())
  
  
}
