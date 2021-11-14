package com.example.android.client

import android.content.Context
import android.content.Intent
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.Drawing
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.canvas.*
import com.example.android.chat.ServerMessage
import com.example.android.chat.UserMessage
import com.example.android.profile.clientService
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

class Gallery :  Fragment() {
    private var galleryDisplay : GroupAdapter<GroupieViewHolder>?= null
    private var displayDrawingGallery : RecyclerView?= null
    private var galleryArray = ArrayList<ReceiveDrawingInformation>()

    override fun onCreateView(
        inflater: LayoutInflater,
        parent: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.activity_gallery, parent, false)


        /*  SocketHandler.setChatSocket()
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
          }*/
     return view
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?){
        super.onViewCreated(view, savedInstanceState)
        val clientService = ClientService()
        displayDrawingGallery = view.findViewById(R.id.gallery_drawings)
        val linearLayoutManager: LinearLayoutManager = LinearLayoutManager(context)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        gallery_drawings?.layoutManager = linearLayoutManager
        buildGallery()
    }
    fun set(GalleryDrawcopy:ArrayList<ReceiveDrawingInformation> ){
        galleryArray= GalleryDrawcopy
        buildGallery()
    }
    fun buildGallery(){
        galleryDisplay = GroupAdapter<GroupieViewHolder>()
        println(galleryArray.size)
        for(drawing in galleryArray){
            val galleryDrawing = GalleryItem(this)
            galleryDrawing.set(drawing)
            galleryDisplay!!.add(galleryDrawing)
        }
        activity?.runOnUiThread{
            gallery_drawings!!.adapter = galleryDisplay
        }
    }

    fun startDrawingActivity(){
        startActivity(Intent(this.context, Drawing::class.java))
    }
}
class GalleryItem(var context: Gallery) : Item<GroupieViewHolder>() {
    private var information: ReceiveDrawingInformation?= null

    override fun getLayout(): Int {
        return R.layout.draw
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        var response_delete: Response<ResponseBody>?=null
        var response_modify: Response<ResponseBody>?=null
        println(information!!.name)
        if(ClientInfo.userId == information!!.ownerId){
            viewHolder.itemView.modify.isVisible= true
            viewHolder.itemView.delete.isVisible= true
            viewHolder.itemView.modify.setOnClickListener() {


                runBlocking {
                    async {
                        launch {
                            response_modify = clientService.getUserGallery()
                        }
                    }
                }
                if (response_modify!!.isSuccessful) {
                    val data = response_modify!!.body()!!.string()
                    gallery = GalleryDrawing().fromJson(data)
                    buildGallery(gallery.drawingList!!)
                }
            }
            viewHolder.itemView.delete.setOnClickListener() {


                runBlocking {
                    async {
                        launch {
                            response_delete = clientService.getUserGallery()
                        }
                    }
                }
                if (response_delete!!.isSuccessful) {
                    val data = response_delete!!.body()!!.string()
                    response_delete = GalleryDrawing().fromJson(data)
                    buildGallery(gallery.drawingList!!)
                }
            }
        }
        else{
            viewHolder.itemView.modify.isVisible= false
            viewHolder.itemView.delete.isVisible= false
        }
        viewHolder.itemView.name.text = information!!.name
        val canvas = GalleryCanvasView(information!!.id!!, context.requireContext())
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
                    DrawingUtils.drawingInformation = AllDrawingInformation().fromJson(data)
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
