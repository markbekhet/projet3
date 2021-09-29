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
        val displaymessage : RecyclerView? = findViewById<RecyclerView>(R.id.recycleView)
        val linearLayoutManager: LinearLayoutManager = LinearLayoutManager(this)
        linearLayoutManager.orientation = LinearLayoutManager.VERTICAL
        displaymessage?.layoutManager = linearLayoutManager
        setContentView(R.layout.message_chat)

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
class UserMessage : Item<GroupieViewHolder>() {
    private var message = "bonjour"
    private var author = "auteur"
    private var date = "date"
    override fun getLayout():Int {
        return R.layout.message
    }

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.message.text = message
        viewHolder.itemView.date.text = "bonjour"
        viewHolder.itemView.user.text = "bonjour"

    }
    fun set(message :String, user : String, date : String){
        this.message = message
        this.author = user
        this.date = date
    }
}