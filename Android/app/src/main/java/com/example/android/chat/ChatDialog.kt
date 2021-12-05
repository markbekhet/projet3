package com.example.android.chat

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.DialogInterface
import android.content.res.Resources
import android.graphics.Color
import android.graphics.Rect
import android.os.Build
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentTransaction
import androidx.lifecycle.Lifecycle
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.client.ClientInfo


class ChatDialog(var content: AppCompatActivity, var room: String = "General") : DialogFragment(), ChatRoomSwitcher {

    val chatRoomsFragmentMap = HashMap<String, Chat>()
    private var chatFragmentTransaction: FragmentTransaction? = null
    init{
        val exist = ChatRooms.chatRooNames.contains(room)
        if(!exist){
            ChatRooms.chatRooNames.add(room)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.sample_chat_dialog, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val manager = childFragmentManager
        val chatSwitchFragmentTransaction = manager.beginTransaction()
        val chatSwitchFragment = ChatSwitchFragment(this)
        chatFragmentTransaction = manager.beginTransaction()
        chatSwitchFragment.showChatSwitch()
        chatSwitchFragmentTransaction.replace(R.id.chatSwitch,
            chatSwitchFragment).commit()


        for(room in ChatRooms.chatRooNames){
            val chatRoom = Chat(room)
            try{
                chatRoom.setMessage(ChatRooms.chats[room]!!)
            } catch(e: Exception){}

            chatRoomsFragmentMap[room] = chatRoom
        }

        chatFragmentTransaction = manager.beginTransaction()
        chatFragmentTransaction!!.replace(R.id.chatsFrame,
            chatRoomsFragmentMap[room]!!).commit()

    }

    companion object {
            const val TAG = "ChatDialog"
    }

    override fun switchChatRoom(name: String) {
        chatFragmentTransaction = childFragmentManager.beginTransaction()
        if(chatFragmentTransaction != null){
            chatFragmentTransaction!!.replace(R.id.chatsFrame,
                chatRoomsFragmentMap[name]!!).commit()
        }
    }

    fun setPreviousMessages(room: String){
        chatRoomsFragmentMap[room]!!.setMessage(ChatRooms.chats[room]!!)

    }
}


