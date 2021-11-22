package com.example.android.chat

import android.app.Dialog
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.drawable.Drawable
import android.os.Build
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
        createChannel(
            getString(R.string.color_image_notification_id),
            room
        )
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

    private fun createChannel(channelId: String, channelName: String) {
        // TODO: Step 1.6 START create a channel
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O){
            val notificationChannel = NotificationChannel(
                channelId, channelName, NotificationManager.IMPORTANCE_HIGH
            )
            notificationChannel.enableLights(true)
            notificationChannel.lightColor = Color.RED
            notificationChannel.enableVibration(true)
            notificationChannel.description = "Time for breakfast"
            val notificationManager = requireActivity().getSystemService(
                NotificationManager::class.java)
            notificationManager.createNotificationChannel(notificationChannel)
        }
        // TODO: Step 1.6 END create a channel

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
