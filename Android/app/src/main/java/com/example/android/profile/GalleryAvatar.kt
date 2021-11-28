package com.example.android.profile

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Base64
import android.view.View
import android.widget.ImageView
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.android.R
import com.example.android.RegisterScreen
import com.example.android.client.ClientService
import com.example.android.client.ProfileModification
import com.example.android.client.AvatarClientInfo
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.avatar.*
import kotlinx.android.synthetic.main.fragment_avatar.view.*
import kotlinx.android.synthetic.main.galleryavatar.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response
import java.io.ByteArrayOutputStream

class GalleryAvatar : AppCompatActivity() {
    private var galleryDisplay : GroupAdapter<GroupieViewHolder>?= null
    var bundleValue: String?=null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.galleryavatar)
        bundleValue = intent.extras!!.getString("request")

        val linearLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        linearLayoutManager.stackFromEnd = true
        val displayGallery : RecyclerView? = findViewById<RecyclerView>(R.id.displayviewgallery)
//        var image : ImageView? = findViewById<ImageView>()
        displayGallery?.layoutManager = linearLayoutManager

        val gallery_image = arrayOf(R.drawable.avataaars,R.drawable.avataaars1,R.drawable.avataaars3,R.drawable.avataaars4,R.drawable.avataaars4,R.drawable.avataaars5,
            R.drawable.avataaars6,R.drawable.avataaars7,R.drawable.avataaars8,R.drawable.avataaars9);
        print(gallery_image)
        fun setAvatarGallery(){
            galleryDisplay = GroupAdapter<GroupieViewHolder>()
            for(image in gallery_image){
                print(image)
                val avatar = AvatarItem(this, image)
                galleryDisplay?.add(avatar)
            }

            displayGallery?.adapter = galleryDisplay

        }
        setAvatarGallery()
    }
    fun close(){
        //include necessary logic in case of profile
        AvatarClientInfo.avatarClientString = createImageStringFromBitmap()
        if(bundleValue!= null){
            val modification = ProfileModification()
            val clientService = ClientService()
            modification.newAvatar = AvatarClientInfo.avatarClientString
            var response: Response<ResponseBody>?= null
            runBlocking {
                async{
                    launch{
                        response = clientService.modifyProfile(modification)
                    }
                }
            }
            if(response!!.isSuccessful){
                finish()
            }
            else{
                runOnUiThread{
                    Toast.makeText(this, "L'avatar ne peut pas se mettre à jour",
                        Toast.LENGTH_SHORT).show()
                }
            }
        }
        else{
            finish()
        }
    }

    fun createImageStringFromBitmap(): String {

        val bitmap: Bitmap = BitmapFactory.decodeResource(resources, AvatarClientInfo.avatarClient!!)

        val resized = Bitmap.createScaledBitmap(
            bitmap, (300).toInt(),
            (300).toInt(), true
        )
        //CONVERT IN image
        //    val decodedString: ByteArray = Base64.decode(encodedImage, Base64.DEFAULT)
        //    val decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
        val stream = ByteArrayOutputStream()
        resized.compress(Bitmap.CompressFormat.PNG, 75, stream)
        val byteArray: ByteArray = stream.toByteArray()

        return Base64.encodeToString(byteArray, Base64.DEFAULT)
    }

}

class AvatarItem(val context: GalleryAvatar,val image: Int) : Item<GroupieViewHolder>() {
    var copyViewItem: View?= null
    override fun getLayout(): Int {
        return R.layout.fragment_avatar
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        copyViewItem = viewHolder.itemView
        viewHolder.itemView.avatarImage.apply {
            Glide.with(viewHolder.root.context)
                .load(image)
                .into(avatarImage)

        }
        viewHolder.itemView.avatarImage.setOnClickListener(){
            AvatarClientInfo.avatarClient = image
            print(viewHolder.itemView.avatarImage)
            print("ok")
            context.close()
        }
    }
}
