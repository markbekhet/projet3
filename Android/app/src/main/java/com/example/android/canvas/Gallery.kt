package com.example.android.canvas

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.R
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import kotlinx.android.synthetic.main.galleryavatar.*

class Gallery : AppCompatActivity() {
    private var galleryDisplay : GroupAdapter<GroupieViewHolder>?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.galleryavatar)
        val linearLayoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL, false)
        linearLayoutManager.stackFromEnd = true
        val displayGallery : RecyclerView? = findViewById<RecyclerView>(R.id.displayviewgallery)
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
           finish()
       }
        setmessage()
    }
}
