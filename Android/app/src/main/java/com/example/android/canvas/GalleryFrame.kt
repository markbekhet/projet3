package com.example.android.canvas

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.android.R
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.avatar.view.*


class GalleryFrame : Fragment() {
    private var galleryDisplay : GroupAdapter<GroupieViewHolder>?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

    }

    override fun onCreateView(
        inflater: LayoutInflater,
        parent: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.galleryavatar, parent, false)
        val linearLayoutManager = LinearLayoutManager(activity, LinearLayoutManager.VERTICAL, false)
        linearLayoutManager.stackFromEnd = true
        val displayGallery : RecyclerView? = view?.findViewById<RecyclerView>(R.id.displayviewgallery)
        displayGallery?.layoutManager = linearLayoutManager

        val gallery_image = arrayOf(R.drawable.avataaars,R.drawable.avataaars1,R.drawable.avataaars3,R.drawable.avataaars4,R.drawable.avataaars4,R.drawable.avataaars5,
            R.drawable.avataaars6,R.drawable.avataaars7,R.drawable.avataaars8,R.drawable.avataaars9);

        fun setmessage(){
            galleryDisplay = GroupAdapter<GroupieViewHolder>()
            for(image in gallery_image){
                print(image)
                val avatar = GalleryAvatar(image)
                galleryDisplay?.add(avatar)
                 }

                displayGallery?.adapter = galleryDisplay

            }
        setmessage()

        return view
    }
}


class GalleryAvatar(val image: Int) : Item<GroupieViewHolder>() {
    override fun getLayout(): Int {
        return R.layout.avatar
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.img_save.apply {
            Glide.with(viewHolder.root.context)
                .load(image)
                .into(img_save)

        }
    }
}
