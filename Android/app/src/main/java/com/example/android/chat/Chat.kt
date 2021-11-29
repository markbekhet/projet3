package com.example.android.chat

import android.graphics.BitmapFactory
import android.os.Bundle
import android.util.Base64
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.bumptech.glide.Glide
import com.example.android.*
import com.example.android.client.ClientInfo
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.chatfragment.*
import kotlinx.android.synthetic.main.message.view.*
import kotlinx.android.synthetic.main.user_item.view.*
import java.util.*
import kotlin.collections.ArrayList

class Chat(var name:String) : Fragment() {
    private var messageDisplay : GroupAdapter<GroupieViewHolder>?= null
    private var serverMessagesArray= ArrayList<ClientMessage>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        /*arguments?.let {
            param1 = it.getString(ARG_PARAM1)
            param2 = it.getString(ARG_PARAM2)
        }*/
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        chatfragmentName.text = name
        val linearLayoutManager = LinearLayoutManager(context)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        messageListView?.layoutManager = linearLayoutManager

        showMessages()
        textField.doAfterTextChanged {
            if(textField.text.isNotEmpty() && textField.text.isNotBlank()){
                button.isEnabled = true
                button.isClickable = true
            }
            else{
                button.isEnabled = false
                button.isClickable = false
            }

        }

        textField.setOnEditorActionListener ( TextView.OnEditorActionListener{
                textView, i, keyEvent ->
            if(keyEvent != null && keyEvent.keyCode.equals(KeyEvent.KEYCODE_ENTER)
                && button.isEnabled){
                button.performClick()
            }
            return@OnEditorActionListener false
        })


        button.setOnClickListener {
            val data = ServerMessage(from= ClientInfo.username,
                message= textField.text.toString(),roomName = name)
            SocketHandler.getChatSocket().emit("msgToServer", data.toJson())
            textField.text.clear()
        }
    }
    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.chatfragment, container, false)
        // Inflate the layout for this fragment
        return view
    }
    fun setMessage(messages: ArrayList<ClientMessage>){
        serverMessagesArray = messages
        showMessages()
    }
    fun showMessages(){
        messageDisplay = GroupAdapter<GroupieViewHolder>()
        for(serverMessage in serverMessagesArray){
            val userMessage = UserMessage(this)
            serverMessage.message?.let { serverMessage.from?.let { it1 ->
                userMessage.set(it,
                    it1, serverMessage.date.toString())
            } }
            messageDisplay?.add(userMessage)
        }
        try{
            requireActivity().runOnUiThread {
                messageListView?.adapter = messageDisplay
                if(serverMessagesArray.size > 0 && messageListView!= null){
                    messageListView.smoothScrollToPosition(serverMessagesArray.size-1)
                }
            }
        }catch(e: Exception){
            println("cannot show the information right now")
        }
    }
}

class UserMessage(var fragment: Chat) : Item<GroupieViewHolder>() {
    private var message = "bonjour"
    private var author = "auteur"
    private var date = "date"
    private var avatar = ""
    override fun getLayout(): Int {
        return R.layout.message
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        for(user in ClientInfo.usersList.userList){
            if(user.pseudo == author){
                avatar = user.avatar
                break
            }
        }
        val decodedModifiedString = Base64.decode(
            avatar, Base64.DEFAULT)
        val decodedModifiedByte = BitmapFactory.decodeByteArray(
            decodedModifiedString,0, decodedModifiedString.size)
        Glide.with(fragment.requireActivity()).load(decodedModifiedByte)
            .fitCenter().into(viewHolder.itemView.avatarChatFragment)
        viewHolder.itemView.message.text = message
        viewHolder.itemView.date.text = date
        viewHolder.itemView.user.text = author

    }

    fun set(message: String, user: String, date: String) {
        this.message = message
        this.author = user
        this.date = date
    }
}
