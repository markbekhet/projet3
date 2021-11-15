package com.example.android.chat

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.android.R
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.chat_room_name.view.*
import kotlinx.android.synthetic.main.fragment_chat_switch.*
import kotlinx.android.synthetic.main.message.view.*
import kotlinx.android.synthetic.main.message.view.message


/**
 * A simple [Fragment] subclass.
 * Use the [ChatSwitchFragment.newInstance] factory method to
 * create an instance of this fragment.
 */

/**
 * This fragment will be responsible to change to send the signal for the activity to
 * replace the chat fragment with the correct one*/
class ChatSwitchFragment(var chatRoomSwitcher: ChatRoomSwitcher) : Fragment() {
    private var chatRoomsDisplay: GroupAdapter<GroupieViewHolder>? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_chat_switch, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val linearLayoutManager = LinearLayoutManager(context)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        chatSwitchRecycleView.layoutManager = linearLayoutManager
        showChatSwitch()
    }

    fun showChatSwitch(){
        chatRoomsDisplay = GroupAdapter<GroupieViewHolder>()
        for(room in ChatRooms.chatRooNames){
            val chatRoomName = ChatRoomName(chatRoomSwitcher)
            chatRoomName.set(room)
            chatRoomsDisplay?.add(chatRoomName)
        }
        try{
            requireActivity().runOnUiThread{
                chatSwitchRecycleView.adapter = chatRoomsDisplay
            }
        } catch(e: Exception){}
    }

    /*companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment ChatSwitchFragment.
         */
        // TODO: Rename and change types and number of parameters
        @JvmStatic
        fun newInstance(param1: String, param2: String) =
            ChatSwitchFragment().apply {
                arguments = Bundle().apply {
                }
            }
    }*/
}

class ChatRoomName(var chatRoomSwitcher: ChatRoomSwitcher): Item<GroupieViewHolder>(){
    private var roomName = ""
    override fun getLayout(): Int {
        return R.layout.chat_room_name
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.chatRoomNameSwitch.text = roomName
        viewHolder.itemView.chatRoomNameSwitch.setOnClickListener {
            chatRoomSwitcher.switchChatRoom(roomName)
        }
    }

    fun set(roomName: String){
        this.roomName = roomName
    }
}
