package com.example.android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.message.*
import kotlinx.android.synthetic.main.message.view.*
import kotlinx.android.synthetic.main.message_chat.*

class New_Message : AppCompatActivity() {
    private val messages : Array<String> = arrayOf("bonjour","salut")

    private var messageDisplay : GroupAdapter<GroupieViewHolder>?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
        val displaymessage : RecyclerView? = findViewById<RecyclerView>(R.id.recycle_view)
        val linearLayoutManager: LinearLayoutManager = LinearLayoutManager(this)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        displaymessage?.layoutManager = linearLayoutManager

        fun setmessage(){
            messageDisplay = GroupAdapter<GroupieViewHolder>()
            for (message in messages){
                val UserMessage = UserMessage()
                UserMessage.set(message , "user", "date")
                messageDisplay?.add(UserMessage)

                println(UserMessage)
            }
            displaymessage?.adapter = messageDisplay

        }
        button.setOnClickListener(){
            setmessage()
        }


    }


}