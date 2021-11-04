package com.example.android.profile

import android.content.Intent
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.Drawing
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.canvas.DrawingUtils
import com.example.android.canvas.JoinDrawingDto
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.client.ClientInfo
import com.example.android.client.ConnectionDisconnectionHistories
import com.example.android.client.DrawingEditionHistories
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.collaboration_history.view.*
import kotlinx.android.synthetic.main.connection_disconnection_item.view.*
import kotlinx.android.synthetic.main.createdraw.*
import java.util.*
import kotlin.collections.ArrayList

class HistoryAndStatistics : AppCompatActivity() {

    private var connectionAdapter : GroupAdapter<GroupieViewHolder>? = null
    private var connectionArray: ArrayList<ConnectionDisconnectionHistories>?= null
    private var disconnectionArray: ArrayList<ConnectionDisconnectionHistories>?= null
    private var disconnectionAdapter: GroupAdapter<GroupieViewHolder>? = null
    private var collaborationArray: ArrayList<DrawingEditionHistories>? = null
    private var collaborationAdapter: GroupAdapter<GroupieViewHolder>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_history_and_statistics)

        val userInfo = getProfile()
        val meanCollaborationTime:TextView = findViewById(R.id.meanCollaborationTime)
        val totalCollaborationTime: TextView = findViewById(R.id.totalCollaborationTime)
        val teamCount: TextView = findViewById(R.id.teamCount)
        val drawingAuthorCount: TextView = findViewById(R.id.drawingAuthorCount)
        val drawingCollaborationCount: TextView = findViewById(R.id.drawingCollaborationCount)

        meanCollaborationTime.text =
            userInfo.averageCollaborationTime.toString()
        totalCollaborationTime.text =
            userInfo.totalCollaborationTime.toString()
        teamCount.text =
            userInfo.numberCollaborationTeams.toString()
        drawingAuthorCount.text =
            userInfo.numberAuthoredDrawings.toString()
        drawingCollaborationCount.text =
            userInfo.numberCollaboratedDrawings.toString()

        val connectionRecycleView: RecyclerView? =
            findViewById(R.id.recycle_view_connection)


        val connectionLayoutManager = LinearLayoutManager(this)
        connectionLayoutManager.orientation = LinearLayoutManager.VERTICAL
        connectionRecycleView?.layoutManager = connectionLayoutManager
        connectionArray = userInfo.getConnectionHistory()

        fun setConnectionHistory(){
            connectionAdapter = GroupAdapter<GroupieViewHolder>()
            for(connection in connectionArray!!){
                val connectionInstance = ConnectionDisconnectionEntry()
                connectionInstance.set(connection.date)
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

        disconnectionArray = userInfo.getDisconnectionHistory()
        fun setDisconnectionHistory(){
            disconnectionAdapter = GroupAdapter<GroupieViewHolder>()
            for(disconnection in disconnectionArray!!){
                val disconnectionInstance = ConnectionDisconnectionEntry()
                disconnectionInstance.set(disconnection.date)
                disconnectionAdapter?.add(disconnectionInstance)
            }
            runOnUiThread {
                disconnectionRecycleView?.adapter = disconnectionAdapter
            }
        }

        setDisconnectionHistory()

        val collaborationRecycleView: RecyclerView? =
            findViewById(R.id.recycle_view_collaborations)
        val collaborationLayoutManager = LinearLayoutManager(this)
        collaborationLayoutManager.orientation = LinearLayoutManager.VERTICAL
        collaborationRecycleView?.layoutManager = collaborationLayoutManager

        collaborationArray = userInfo.getDrawingHistories()
        fun setCollaborationHistory(){
            collaborationAdapter = GroupAdapter<GroupieViewHolder>()
            for(collaboration in collaborationArray!!){
                val collaborationInstance = CollaborationEntry(this)
                collaboration.drawingId?.let {
                    collaboration.date?.let { it1 ->
                        collaboration.drawingVisibility?.let { it2 ->
                            collaboration.drawingName?.let { it3 ->
                                collaborationInstance.set(
                                    it, it1,
                                    it2, it3
                                )
                            }
                        }
                    }
                }
                collaborationAdapter?.add(collaborationInstance)
            }
            runOnUiThread {
                disconnectionRecycleView?.adapter = collaborationAdapter
            }
        }
    }
    fun startDrawingActivity(){
        startActivity(Intent(this, Drawing::class.java))
    }
}

class ConnectionDisconnectionEntry : Item<GroupieViewHolder>() {

    var date: String? =null
    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.connectionDisconnectionTime.text = date
    }

    override fun getLayout(): Int {
        return R.layout.connection_disconnection_item
    }

    fun set(date: String?){
        this.date = date
    }

}

class CollaborationEntry(var activity: HistoryAndStatistics) : Item<GroupieViewHolder>() {

    private var date: String ?= null
    private var drawingId: Int?= null
    private var drawingName: String?=null
    private var visibility: Int?=null

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.collaborationTime.text = date
        viewHolder.itemView.drawingName.text = drawingName
        viewHolder.itemView.join.setOnClickListener {
            DrawingUtils.currentDrawingId = drawingId!!
            val joinRequest = JoinDrawingDto(
                DrawingUtils.currentDrawingId,
                ClientInfo.userId)

            SocketHandler.getChatSocket()!!.emit("joinDrawing", joinRequest.toJson())
            SocketHandler.getChatSocket()!!.on("drawingInformations") { args ->
                if (args[0] != null) {
                    val data = args[0] as String
                    DrawingUtils.drawingInformation =
                        ReceiveDrawingInformation().fromJson(data)
                    activity.startDrawingActivity()
                }
            }
        }
    }

    override fun getLayout(): Int {
        return R.layout.collaboration_history
    }

    fun set(drawingId: Int, date: String, visibility: Int, drawingName: String){
        this.date = date
        this.drawingId = drawingId
        this.drawingName = drawingName
        this.visibility =  visibility
    }
}
