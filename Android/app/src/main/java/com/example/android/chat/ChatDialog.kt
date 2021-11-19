package com.example.android.chat

import android.app.Dialog
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.text.TextPaint
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentTransaction
import com.example.android.R
import com.example.android.SocketHandler
import kotlinx.android.synthetic.main.sample_chat_dialog.*


class ChatDialog(var content: AppCompatActivity, var room: String = "General") : DialogFragment(), ChatRoomSwitcher {

    private val chatRoomsFragmentMap = HashMap<String, Chat>()
    private var chatFragmentTransaction: FragmentTransaction? = null
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



        SocketHandler.getChatSocket().on("msgToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val messageFromServer = ClientMessage().fromJson(data)
                val roomName = messageFromServer.roomName
                ChatRooms.chats[roomName]!!.add(messageFromServer)
                try{
                    chatRoomsFragmentMap[roomName]!!.setMessage(ChatRooms.chats[roomName]!!)
                }
                catch(e: Exception){}
            }
        }

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
