package com.example.android

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.canvas.GalleryDrawing
import com.example.android.client.*
import com.example.android.profile.OwnProfile
import com.google.gson.Gson
import io.socket.client.Socket
import kotlinx.android.synthetic.main.activity_gallery.*
import kotlinx.android.synthetic.main.content_landing_page.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JSON.Companion.context
import okhttp3.ResponseBody
import retrofit2.Response

class LandingPage : AppCompatActivity() {
    private var texte: TextView? = null
    private var button: Button? = null
    private var clientService = ClientService()
    private var chatSocket: Socket? = null
    private var drawingSocket: Socket?= null
    var gallery  = GalleryDrawing()
    var response: Response<ResponseBody>?=null
    private var displayDrawingGallery : RecyclerView?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.content_landing_page)
        val clientService = ClientService()
        //Initialize chat socket
        SocketHandler.setChatSocket()
        SocketHandler.establishChatSocketConnection()
        val manager = supportFragmentManager
        val usersFragmentTransaction = manager.beginTransaction()
        val galleryDraws = Gallery()

        usersFragmentTransaction.replace(R.id.gallery_frame, galleryDraws).commit()


        runBlocking {
            async{
                launch {
                    response = clientService.getUserGallery()
                }
            }
        }
        if(response!!.isSuccessful){
            val data = response!!.body()!!.string()
            gallery = GalleryDrawing().fromJson(data)

            galleryDraws.set(gallery.drawingList!!)
        }
        chatSocket = SocketHandler.getChatSocket()

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
