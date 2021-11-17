package com.example.android

import android.content.Context
import android.content.Intent
import android.graphics.*
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
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
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import com.example.android.delete
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

     return view
    }
    override fun onViewCreated(view: View, savedInstanceState: Bundle?){
        super.onViewCreated(view, savedInstanceState)
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

    fun startDrawingActivity(data: String, drawingID: Int){
        val bundle = Bundle()
        bundle.putInt("drawingID", drawingID)
        bundle.putString("drawingInformation", data)
        startActivity(Intent(this.context, Drawing::class.java).putExtras(bundle))
    }

    fun startModifyingActivity(information: ReceiveDrawingInformation){
        val bundle = Bundle()
        bundle.putString("drawingInformation", information.toJson())

        startActivity(Intent(this.context, ModifyDrawingParams::class.java).putExtras(bundle))
    }
}


class GalleryItem(var fragment: Gallery) : Item<GroupieViewHolder>() {
    private var information: ReceiveDrawingInformation?= null
    private var clientService = ClientService()
    override fun getLayout(): Int {
        return R.layout.draw
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        println(information!!.name)
        if(ClientInfo.userId == information!!.ownerId){
            viewHolder.itemView.modify.isVisible= true
            viewHolder.itemView.delete.isVisible= true
            viewHolder.itemView.modify.setOnClickListener {
                fragment.startModifyingActivity(information!!)
            }

            viewHolder.itemView.delete.setOnClickListener{
                var response: Response<ResponseBody>?= null
                val deleteDrawingDto = DeleteDrawingDt(information!!.id!!, ClientInfo.userId)
                runBlocking {
                    async {
                        launch {
                            response = clientService.deleteDrawing(deleteDrawingDto)
                        }
                    }
                }
                if (response!!.isSuccessful) {
                    fragment.requireActivity().runOnUiThread{
                        Toast.makeText(fragment.context, "Dessin supprimée avec succès",
                            Toast.LENGTH_SHORT).show()
                    }
                }
            }

        }
        else{
            viewHolder.itemView.modify.isVisible= false
            viewHolder.itemView.delete.isVisible= false
        }
        viewHolder.itemView.name.text = information!!.name
        val canvas = GalleryCanvasView(information!!.width!!, information!!.height!!,information!!.id!!, fragment.requireContext())
        canvas.parseExistingDrawings(information!!.contents)
        canvas.setBackgroundColor(
            Color.parseColor("#ff${information!!.bgColor}"))
        val params: ViewGroup.LayoutParams =
            viewHolder.itemView.fl_drawing_view_gallery.getLayoutParams()
        params.width= 300
        params.height= 300
        viewHolder.itemView.fl_drawing_view_gallery.setLayoutParams(params)
        viewHolder.itemView.fl_drawing_view_gallery.addView(canvas)
        viewHolder.itemView.fl_drawing_view_gallery.setOnClickListener {
            val drawingID = information!!.id!!
            val joinRequest = JoinDrawingDto(drawingID,
                ClientInfo.userId)

            SocketHandler.getChatSocket()!!.emit("joinDrawing", joinRequest.toJson())
            var i = 0
            SocketHandler.getChatSocket()!!.on("drawingInformations"){ args ->
                if(args[0]!=null && i==0){
                    val data = args[0] as String
                    fragment.startDrawingActivity(data, drawingID)
                    i++
                }
            }
        }

    }
    fun set(information_:ReceiveDrawingInformation) {
        this.information = information_
    }
}
