package com.example.android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import io.socket.client.Socket
import kotlinx.android.synthetic.main.message.view.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONObject

class Chat : AppCompatActivity() {
    private var mSocket: Socket? =null
    private var mClientService: ClientService ?= null
    private var messageDisplay : GroupAdapter<GroupieViewHolder>?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
        val displaymessage : RecyclerView? = findViewById<RecyclerView>(R.id.recycle_view)
        val linearLayoutManager: LinearLayoutManager = LinearLayoutManager(this)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        displaymessage?.layoutManager = linearLayoutManager

        SocketHandler.setSocket()
        mSocket = SocketHandler.getMSocket()
        mSocket?.connect()

        mClientService = ClientService()
        val textMessage: EditText = findViewById(R.id.textView)
        val sendButton: Button = findViewById(R.id.button)

        sendButton.setOnClickListener {
            val data = ClientMessage(clientName= "User",
                message= textMessage.text.toString())
            mSocket?.emit("msgToServer", data.toJson())
            textMessage.text.clear()
        }
        fun setmessage(serverMessage: ServerMessage){
            messageDisplay = GroupAdapter<GroupieViewHolder>()
            val UserMessage = UserMessage()
            serverMessage.message?.let { serverMessage.clientName?.let { it1 ->
                UserMessage.set(it,
                    it1, serverMessage.date.toString())
            } }
            messageDisplay?.add(UserMessage)

            println(UserMessage)
            runOnUiThread {
                displaymessage?.adapter = messageDisplay
            }

        }

        mSocket?.on("msgToClient") { args ->
            if (args[0] != null) {
                val data = args[0] as JSONObject
                val serverMessage = ServerMessage().fromJson(data)
                setmessage(serverMessage)
                println("Data received from user" +
                    " ${serverMessage.clientName} at ${serverMessage.date?.hour}:" +
                    "${serverMessage.date?.minutes}:${serverMessage.date?.seconds}" +
                    " ${serverMessage.message}")
                runOnUiThread {
                    Toast.makeText(this, serverMessage.toString(), Toast.LENGTH_SHORT).show()
                }
            };
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        mSocket?.disconnect()
        runBlocking{
            async {
                launch {
                    mClientService!!.disconnect(ClientInfo.username)
                }
            }
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
