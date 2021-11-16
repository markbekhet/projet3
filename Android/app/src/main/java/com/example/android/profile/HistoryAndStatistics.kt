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
import com.example.android.canvas.AllDrawingInformation
import com.example.android.canvas.DrawingUtils
import com.example.android.canvas.JoinDrawingDto
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.client.*
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.activity_history_and_statistics.*
import kotlinx.android.synthetic.main.collaboration_history.view.*
import kotlinx.android.synthetic.main.connection_disconnection_item.view.*
import kotlinx.android.synthetic.main.createdraw.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response
import java.util.*
import kotlin.collections.ArrayList

class HistoryAndStatistics : AppCompatActivity() {

    private var connectionAdapter : GroupAdapter<GroupieViewHolder>? = null
    private var connectionArray: ArrayList<ConnectionDisconnectionHistories>?= null
    private var disconnectionArray: ArrayList<ConnectionDisconnectionHistories>?= null
    private var disconnectionAdapter: GroupAdapter<GroupieViewHolder>? = null
    private var collaborationArray: ArrayList<DrawingEditionHistories>? = null
    private var collaborationAdapter: GroupAdapter<GroupieViewHolder>? = null
    private var userInfo = UserProfileInformation()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_history_and_statistics)
        val data = intent.extras!!.getString("profileInformation")
        userInfo = UserProfileInformation().fromJson(data)

        val connectionLayoutManager = LinearLayoutManager(this)
        connectionLayoutManager.orientation = LinearLayoutManager.VERTICAL
        recycle_view_connection.layoutManager = connectionLayoutManager

        val disconnectionLayoutManager = LinearLayoutManager(this)
        disconnectionLayoutManager.orientation = LinearLayoutManager.VERTICAL
        recycle_view_disconnection?.layoutManager = disconnectionLayoutManager


        val collaborationLayoutManager = LinearLayoutManager(this)
        collaborationLayoutManager.orientation = LinearLayoutManager.VERTICAL
        recycle_view_collaborations.layoutManager = collaborationLayoutManager

        updateUI()
    }
    fun startDrawingActivity(){
        startActivity(Intent(this, Drawing::class.java))
    }

    fun updateUI(){
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

        connectionArray = userInfo.getConnectionHistory()
        setConnectionHistory()

        disconnectionArray = userInfo.getDisconnectionHistory()
        setDisconnectionHistory()

        collaborationArray = userInfo.getDrawingHistories()
        setCollaborationHistory()
    }

    fun setDisconnectionHistory(){
        disconnectionAdapter = GroupAdapter<GroupieViewHolder>()
        for(disconnection in disconnectionArray!!){
            val disconnectionInstance = ConnectionDisconnectionEntry()
            disconnectionInstance.set(disconnection.date)
            disconnectionAdapter?.add(disconnectionInstance)
        }
        runOnUiThread {
            recycle_view_disconnection?.adapter = disconnectionAdapter
        }
    }

    fun setCollaborationHistory(){
        collaborationAdapter = GroupAdapter<GroupieViewHolder>()
        for(collaboration in collaborationArray!!){
            val collaborationInstance = CollaborationEntry(this)
            collaborationInstance.set(collaboration)

            collaborationAdapter?.add(collaborationInstance)
        }
        runOnUiThread {
            recycle_view_collaborations?.adapter = collaborationAdapter
        }
    }

    fun setConnectionHistory(){
        connectionAdapter = GroupAdapter<GroupieViewHolder>()
        for(connection in connectionArray!!){
            val connectionInstance = ConnectionDisconnectionEntry()
            connectionInstance.set(connection.date)
            connectionAdapter?.add(connectionInstance)
        }
        runOnUiThread {
            recycle_view_connection?.adapter = connectionAdapter
        }

    }

    override fun onRestart() {
        super.onRestart()
        //maybe change it back to socket later
        var response: Response<ResponseBody>?=  null
        runBlocking{
            async{
                launch{
                   response = ClientService().getUserProfileInformation(ClientInfo.userId)
                }
            }
        }
        if(response!!.isSuccessful){
            val data = response!!.body()!!.string()
            userInfo = UserProfileInformation().fromJson(data)
            updateUI()
        }
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
        this.date = date.toString()
    }

}

class CollaborationEntry(var activity: HistoryAndStatistics) : Item<GroupieViewHolder>() {

    private var collaboration:DrawingEditionHistories?= null

    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.collaborationTime.text = collaboration!!.date
        viewHolder.itemView.drawingName.text = collaboration!!.drawingName
        if(collaboration!!.drawingStae == DrawingAvailability.DELETED.i){
            viewHolder.itemView.join.isClickable = false
            viewHolder.itemView.join.isEnabled = false
        } else{
            viewHolder.itemView.join.setOnClickListener {
                DrawingUtils.currentDrawingId = collaboration!!.drawingId!!
                val joinRequest = JoinDrawingDto(
                    DrawingUtils.currentDrawingId,
                    ClientInfo.userId)
                var i = 0
                SocketHandler.getChatSocket().emit("joinDrawing", joinRequest.toJson())
                SocketHandler.getChatSocket().on("drawingInformations") { args ->
                    if (args[0] != null && i == 0) {
                        val data = args[0] as String
                        DrawingUtils.drawingInformation =
                            AllDrawingInformation().fromJson(data)
                        activity.startDrawingActivity()
                        i++
                    }
                }
            }
        }

    }

    override fun getLayout(): Int {
        return R.layout.collaboration_history
    }

    fun set(collaboration: DrawingEditionHistories){
        this.collaboration = collaboration
    }
}
