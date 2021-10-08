package com.example.android.profile

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.ScrollView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.R
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.collaboration_history.view.*
import kotlinx.android.synthetic.main.connection_disconnection_item.view.*
import java.util.*
import kotlin.collections.ArrayList

class HistoryAndStatistics : AppCompatActivity() {

    private var connectionAdapter : GroupAdapter<GroupieViewHolder>? = null
    private var connectionArray: ArrayList<String>?= null
    private var disconnectionAdapter: GroupAdapter<GroupieViewHolder>? = null
    private var collaborationAdapter: GroupAdapter<GroupieViewHolder>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_history_and_statistics)

        val connectionRecycleView: RecyclerView? =
            findViewById(R.id.recycle_view_connection)
        val connectionLayoutManager = LinearLayoutManager(this)
        connectionLayoutManager.orientation = LinearLayoutManager.VERTICAL
        connectionRecycleView?.layoutManager = connectionLayoutManager

        connectionArray = ArrayList()
        for (i in 1..20){
            connectionArray?.add(Date().toString())
        }

        fun setConnectionHistory(){
            connectionAdapter = GroupAdapter<GroupieViewHolder>()
            for(connection in connectionArray!!){
                val connectionInstance = ConnectionDisconnectionEntry()
                connectionInstance.set(connection)
                connectionAdapter?.add(connectionInstance)
            }
            runOnUiThread {
                connectionRecycleView?.adapter = connectionAdapter
            }

        }

        setConnectionHistory()

        val disconnectionRecycleView: RecyclerView? =
            findViewById(R.id.recycle_view_disconnection)
        val disconnectionLayoutManager = LinearLayoutManager(this)
        disconnectionLayoutManager.orientation = LinearLayoutManager.VERTICAL
        disconnectionRecycleView?.layoutManager = disconnectionLayoutManager

        fun setDisconnectionHistory(){
            disconnectionAdapter = GroupAdapter<GroupieViewHolder>()
            for(connection in connectionArray!!){
                val disconnectionInstance = ConnectionDisconnectionEntry()
                disconnectionInstance.set(connection)
                disconnectionAdapter?.add(disconnectionInstance)
            }
            runOnUiThread {
                disconnectionRecycleView?.adapter = disconnectionAdapter
            }
        }


        val collaborationRecycleView: RecyclerView? =
            findViewById(R.id.recycle_view_collaborations)
        val collaborationLayoutManager = LinearLayoutManager(this)
        collaborationLayoutManager.orientation = LinearLayoutManager.VERTICAL
        collaborationRecycleView?.layoutManager = collaborationLayoutManager





    }
}

class ConnectionDisconnectionEntry : Item<GroupieViewHolder>() {

    private var date: String? =null
    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.connectionDisconnectionTime.text = date
    }

    override fun getLayout(): Int {
        return R.layout.connection_disconnection_item
    }

    fun set(date: String){
        this.date = date
    }

}

class CollaborationEntry : Item<GroupieViewHolder>() {

    private var date: String ?= null
    private var drawingId: String?= null

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.collaborationTime.text = date
        viewHolder.itemView.viewDrawing.text = drawingId
    }

    override fun getLayout(): Int {
        return R.layout.collaboration_history
    }

    fun set(date: String, drawingId: String){
        this.date = date
        this.drawingId = drawingId
    }
}
