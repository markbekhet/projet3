package com.example.android.client

import android.content.Context
import android.content.Intent
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.Drawing
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.canvas.*
import com.example.android.chat.ServerMessage
import com.example.android.chat.UserMessage
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.activity_gallery.*
import kotlinx.android.synthetic.main.activity_login_screen.*
import kotlinx.android.synthetic.main.dessin.*
import kotlinx.android.synthetic.main.draw.view.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Response

class Gallery : AppCompatActivity() {
    private var galleryDisplay : GroupAdapter<GroupieViewHolder>?= null
    private var displayDrawingGallery : RecyclerView?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_gallery)
        val clientService = ClientService()
        displayDrawingGallery = findViewById(R.id.gallery_drawings)
        val linearLayoutManager: LinearLayoutManager = LinearLayoutManager(this)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        displayDrawingGallery?.layoutManager = linearLayoutManager
        SocketHandler.setChatSocket()
        SocketHandler.establishChatSocketConnection()
        var gallery  = GalleryDrawing()
        var response: Response<ResponseBody>?=null
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
            buildGallery(gallery.drawingList!!)
        }

    }
    fun buildGallery(drawingList :ArrayList<ReceiveDrawingInformation>){
        galleryDisplay = GroupAdapter<GroupieViewHolder>()
        for(drawing in drawingList){
            val galleryDrawing = GalleryItem(this)
            galleryDrawing.set(drawing)
            galleryDisplay!!.add(galleryDrawing)
        }
        displayDrawingGallery!!.adapter = galleryDisplay
    }

    fun startDrawingActivity(){
        startActivity(Intent(this, Drawing::class.java))
    }
}
class GalleryItem(var context: Gallery) : Item<GroupieViewHolder>() {
    private var information: ReceiveDrawingInformation?= null

    override fun getLayout(): Int {
        return R.layout.draw
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        println(information!!.name)
        viewHolder.itemView.name.text = information!!.name
        val canvas = GalleryCanvasView(information!!.id!!, context)
        canvas.parseExistingDrawings(information!!.contents)
        val params: ViewGroup.LayoutParams = viewHolder.itemView.fl_drawing_view_gallery.getLayoutParams()
        params.width= 300
        params.height= 300
        viewHolder.itemView.fl_drawing_view_gallery.setLayoutParams(params)
        canvas.setBackgroundColor(
            Color.parseColor("#ff${information!!.bgColor}"))
        viewHolder.itemView.fl_drawing_view_gallery.addView(canvas)
        viewHolder.itemView.fl_drawing_view_gallery.setOnClickListener {
            DrawingUtils.currentDrawingId = information!!.id!!
            var joinRequest = JoinDrawingDto(DrawingUtils.currentDrawingId,
                ClientInfo.userId)

            SocketHandler.getChatSocket()!!.emit("joinDrawing", joinRequest.toJson())
            var i = 0
            SocketHandler.getChatSocket()!!.on("drawingInformations"){ args ->
                if(args[0]!=null && i==0){
                    val data = args[0] as String
                    DrawingUtils.drawingInformation =
                        information
                    context.startDrawingActivity()
                    i++
                }
            }
        }

    }

    fun set(information_:ReceiveDrawingInformation) {
        this.information = information_
    }
}
