package com.example.android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import java.net.URISyntaxException


class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        SocketHandler.setSocket()
        val mSocket = SocketHandler.getMSocket()
        mSocket?.connect()

        /*try {
            mSocket = IO.socket("http://192.168.0.112:3000")
            mSocket.connect()
            mSocket.emit("msgToServer", mSocket.id())
        } catch (e: URISyntaxException) {
        }
        val textMessage: EditText = findViewById(R.id.textView)
        val sendButton: Button = findViewById(R.id.button)
        sendButton.setOnClickListener {
            Toast.makeText(this, textMessage.text, Toast.LENGTH_SHORT).show()
            mSocket.emit("msgToServer", textMessage.text)
            textMessage.text.clear()
        }
        val textView: TextView = findViewById(R.id.textView2)
        mSocket?.on("msgToClient") { args ->
            if (args[0] != null) {
                var data = args[0] as String
                Log.d("output", data)
                runOnUiThread {
                    Toast.makeText(this, "Data received from socket", Toast.LENGTH_SHORT).show()
                    var existingText = textView.text
                    textView.setText(existingText.toString() + "/n$data")
                }
            };
        }*/
        /*val options = IO.Options()
        options.reconnection = true //reconnection
        options.forceNew = true
        runBlocking {
            val chat: Chat = application as Chat
            mSocket = chat.getMSocket()
            chat.establishConnection()
            mSocket?.on(Socket.EVENT_CONNECT){
                Toast.makeText(applicationContext,"Socket is connected",Toast.LENGTH_SHORT).show()
            }
        }

        if(mSocket?.connected() == true)
        {
            Toast.makeText(this,"Socket is connected",Toast.LENGTH_SHORT).show()
        }*/


    }

}
