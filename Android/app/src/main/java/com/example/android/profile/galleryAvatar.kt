package com.example.android.profile

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.ImageView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.android.R
import com.example.android.RegisterScreen
import com.example.android.client.avatarClientInfo
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.avatar.*
import kotlinx.android.synthetic.main.fragment_avatar.view.*
import kotlinx.android.synthetic.main.galleryavatar.*

class Gallery : AppCompatActivity() {
    private var galleryDisplay : GroupAdapter<GroupieViewHolder>?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.galleryavatar)
        val linearLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        linearLayoutManager.stackFromEnd = true
        val displayGallery : RecyclerView? = findViewById<RecyclerView>(R.id.displayviewgallery)
//        var image : ImageView? = findViewById<ImageView>()
        displayGallery?.layoutManager = linearLayoutManager

        val gallery_image = arrayOf(R.drawable.avataaars,R.drawable.avataaars1,R.drawable.avataaars3,R.drawable.avataaars4,R.drawable.avataaars4,R.drawable.avataaars5,
            R.drawable.avataaars6,R.drawable.avataaars7,R.drawable.avataaars8,R.drawable.avataaars9);
        print(gallery_image)
        fun setmessage(){
            galleryDisplay = GroupAdapter<GroupieViewHolder>()
            for(image in gallery_image){
                print(image)
                val avatar = GalleryAvatar(image)
                galleryDisplay?.add(avatar)
            }

            displayGallery?.adapter = galleryDisplay

        }
       fermer.setOnClickListener(){
           startActivity(Intent(this, RegisterScreen::class.java))
       }
        setmessage()
    }
}
class GalleryAvatar(val image: Int) : Item<GroupieViewHolder>() {
    override fun getLayout(): Int {
        return R.layout.fragment_avatar
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.avatarImage.apply {
            Glide.with(viewHolder.root.context)
                .load(image)
                .into(avatarImage)

        }
        viewHolder.itemView.avatarImage.setOnClickListener(){
            avatarClientInfo.avatarClient = image
            print(viewHolder.itemView.avatarImage)
            print("ok")
            print(avatarClientInfo.avatarClient)
            viewHolder.itemView.selectionne.visibility
        }
    }
}