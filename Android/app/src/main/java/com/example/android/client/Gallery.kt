package com.example.android.client

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.R
import com.example.android.canvas.ContentDrawingSocket
import com.example.android.canvas.GalleryDrawing
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.chat.ServerMessage
import com.example.android.chat.UserMessage
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.activity_gallery.*
import kotlinx.android.synthetic.main.activity_login_screen.*
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
            val galleryDrawing = GalleryItem()
            galleryDrawing.set(drawing)
            galleryDisplay!!.add(galleryDrawing)
        }
        displayDrawingGallery!!.adapter = galleryDisplay
    }
}
class GalleryItem : Item<GroupieViewHolder>() {
    private var information: ReceiveDrawingInformation?= null

    override fun getLayout(): Int {
        return R.layout.draw
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        println(information!!.name)
        viewHolder.itemView.name.text = information!!.name

    }

    fun set(information_:ReceiveDrawingInformation) {
        this.information = information_
    }
}
