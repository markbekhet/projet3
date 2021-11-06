package com.example.android.client

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.RecyclerView
import com.example.android.R
import com.example.android.canvas.ContentDrawingSocket
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.chat.ServerMessage
import com.example.android.chat.UserMessage
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.activity_gallery.*
import kotlinx.android.synthetic.main.draw.view.*
import org.json.JSONObject

class Gallery : AppCompatActivity() {
    private var messageDisplay : GroupAdapter<GroupieViewHolder>?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_gallery)
        val displayDrawingGallery : RecyclerView? = findViewById<RecyclerView>(R.id.gallery_drawings)
        val serverGallery  =ArrayList<ReceiveDrawingInformation>()
        fun setmessage(){
            messageDisplay = GroupAdapter<GroupieViewHolder>()
            for(serverMessage in serverGallery){
                val userMessage = UserMessage()
                serverMessage.bgColor?.let { serverMessage.contents?.let { it1 ->
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
    class GalleryDraw : Item<GroupieViewHolder>() {
        private var bgColor ="bgColor"
        private var height = "height"
        private var width = "width"
        private var visibility = "visibility"
        private var name = "name"
        private var color = "color"
        private var contents:ArrayList<ContentDrawingSocket> =  ArrayList<ContentDrawingSocket>()

        override fun getLayout(): Int {
            return R.layout.draw
        }

        override fun bind(viewHolder: GroupieViewHolder, position: Int) {
            viewHolder.itemView.visibiliti.text = visibility
            viewHolder.itemView.name.text = name
            viewHolder.itemView.color.text = color

        }

        fun set(visibility: String, width: String, height: String, bgColor: String, name: String,color:String) {
            this.visibility = visibility
            this.height = height
            this.width = width
            this.bgColor = bgColor
            this.name = name
            this.color = color
        }
}