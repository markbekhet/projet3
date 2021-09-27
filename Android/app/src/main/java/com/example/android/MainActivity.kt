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
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.lang.Runnable
import java.net.HttpURLConnection
import java.net.URISyntaxException
import java.net.URL
import java.net.URLEncoder


class MainActivity : AppCompatActivity() {
    private var mSocket: Socket ? =null
    private var mClientService: ClientService ?= null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
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
                    mClientService!!.disconnect("User")
                }
            }
        }
    }

}
