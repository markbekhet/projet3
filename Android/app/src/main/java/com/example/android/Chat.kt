package com.example.android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import io.socket.client.Socket
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONObject

class Chat : AppCompatActivity() {
    private var mSocket: Socket? =null
    private var mClientService: ClientService ?= null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
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

        val textView: TextView = findViewById(R.id.textView2)
        mSocket?.on("msgToClient") { args ->
            if (args[0] != null) {
                val data = args[0] as JSONObject
                val serverMessage = ServerMessage().fromJson(data)
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
