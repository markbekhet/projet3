package com.example.android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.JsonWriter
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import com.google.gson.Gson
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


        val textMessage: EditText = findViewById(R.id.textView)
        val sendButton: Button = findViewById(R.id.button)

        sendButton.setOnClickListener {
            Toast.makeText(this, textMessage.text, Toast.LENGTH_SHORT).show()
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

}
