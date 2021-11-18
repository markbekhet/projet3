package com.example.android

import android.content.Intent
import android.media.MediaPlayer
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.android.client.*
import com.example.android.profile.OwnProfile
import com.google.gson.Gson
import io.socket.client.Socket
import kotlinx.android.synthetic.main.content_landing_page.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class LandingPage : AppCompatActivity() {
    private var texte: TextView? = null
    private var button: Button? = null
    private var clientService = ClientService()
    private var chatSocket: Socket? = null
    private var drawingSocket: Socket?= null
    //val music : MediaPlayer= MediaPlayer.create()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.content_landing_page)
        //Initialize chat socket
        SocketHandler.setChatSocket()
        SocketHandler.establishChatSocketConnection()
        chatSocket = SocketHandler.getChatSocket()

//        music.start()
        chatSocket?.on("usersArrayToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                ClientInfo.usersList= Gson().fromJson(data, UsersArrayList::class.java)
            }
        }

        chatSocket?.on("teamsArrayToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                ClientInfo.teamsList = Gson().fromJson(data, TeamsArrayList::class.java)
            }
        }

        //initialize drawing socket
        //SocketHandler.setDrawingSocket()
        //SocketHandler.establishDrawingSocketConnection()
        //drawingSocket = SocketHandler.getDrawingSocket()

        profileButton.setOnClickListener {
            startActivity(Intent(this, OwnProfile::class.java))
        }

        creerSalon.setOnClickListener{
            startActivity(Intent(this, CreateDraw::class.java))}

        disconnect.setOnClickListener {
            disconnect()
        }

//            if (createDrawing == null) {
//                createDrawing = Dialog(this)
//                createDrawing!!.setContentView(R.layout.createdraw)
//                createDrawing!!.show()
//                button = createDrawing!!.findViewById(R.id.button)
//                button?.setOnClickListener(){
//                    startActivity(Intent(this, Drawing::class.java))
//                    createDrawing!!.hide()
//                    createDrawing = null
//                }
////                texte = createDrawing!!.findViewById(R.id.fermer)
//                texte?.isEnabled = true
//                texte?.setOnClickListener {
//                    createDrawing!!.hide()
//                    createDrawing = null
//                }
//
//        }

    }
    fun disconnect(){
        runBlocking{
            launch{
                clientService.disconnect()
            }

        }
        chatSocket?.disconnect()
        drawingSocket?.disconnect()
        finish()
    }
    override fun onDestroy() {
        disconnect()
        super.onDestroy()
    }
}
