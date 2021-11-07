package com.example.android.chat

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.KeyEvent
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.*
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import io.socket.client.Socket
import kotlinx.android.synthetic.main.message.view.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import java.util.*
import kotlin.collections.ArrayList

class Chat : AppCompatActivity() {
    private var mSocket: Socket? =null
    private var mClientService: ClientService?= null
    private var messageDisplay : GroupAdapter<GroupieViewHolder>?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.chatfragment)

        val displayMessage : RecyclerView? = findViewById<RecyclerView>(R.id.chatfragment)
        val linearLayoutManager: LinearLayoutManager = LinearLayoutManager(this)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        displayMessage?.layoutManager = linearLayoutManager

        mSocket = SocketHandler.getChatSocket()

        mClientService = ClientService()
        val textMessage: EditText = findViewById(R.id.textField)
        val sendButton: Button = findViewById(R.id.button)


        textMessage.doAfterTextChanged {
            if(textMessage.text.isNotEmpty()){
                sendButton.isEnabled = true
                sendButton.isClickable = true
            }
            else{
                sendButton.isEnabled = false
                sendButton.isClickable = false
            }

        }

        textMessage.setOnEditorActionListener ( TextView.OnEditorActionListener{
                textView, i, keyEvent ->
            if(keyEvent != null && keyEvent.keyCode.equals(KeyEvent.KEYCODE_ENTER)
                && sendButton.isEnabled){
                sendButton.performClick()
            }
            return@OnEditorActionListener false
        })


        fun getCurrentDateTime(): Date {
            return Calendar.getInstance().time
        }

        sendButton.setOnClickListener {

            val c = Calendar.getInstance()
            val hour = c.get(Calendar.HOUR_OF_DAY).toString()
            val minute=c.get(Calendar.MINUTE).toString()
            val second =c.get(Calendar.SECOND).toString()
            val date : CustomDate = CustomDate(hour,minute,second)
            val data = ServerMessage(clientName= ClientInfo.username,
                message= textMessage.text.toString(),date)
            mSocket?.emit("msgToServer", data.toJson())
            textMessage.text.clear()
        }

        val serverMessagesArray = ArrayList<ServerMessage>()
        fun setmessage(){
            messageDisplay = GroupAdapter<GroupieViewHolder>()
            for(serverMessage in serverMessagesArray){
                val userMessage = UserMessage()
                serverMessage.message?.let { serverMessage.clientName?.let { it1 ->
                    userMessage.set(it,
                        it1, serverMessage.date.toString())
                } }
                messageDisplay?.add(userMessage)
            }
            runOnUiThread {
                displayMessage?.adapter = messageDisplay
            }

        }

        mSocket?.on("msgToClient") { args ->
            if (args[0] != null) {
                val data = args[0] as JSONObject
                val serverMessage = ServerMessage().fromJson(data)
                serverMessagesArray.add(serverMessage)
                setmessage()
                println("Data received from user" +
                    " ${serverMessage.clientName} at ${serverMessage.date?.hour}:" +
                    "${serverMessage.date?.minutes}:${serverMessage.date?.seconds}" +
                    " ${serverMessage.message}")
            };
        }
    }

}
class UserMessage : Item<GroupieViewHolder>() {
    private var message = "bonjour"
    private var author = "auteur"
    private var date = "date"
    override fun getLayout(): Int {
        return R.layout.message
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
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
