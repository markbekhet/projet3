package com.example.android.profile

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.ActionBar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.*
import com.example.android.canvas.*
import com.example.android.chat.ChatDialog
import com.example.android.chat.ChatRooms
import com.example.android.chat.ClientMessage
import com.example.android.client.*
import com.example.android.team.CantJoin
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
        val chatDialog = ChatDialog(this)

        supportActionBar!!.setDisplayShowHomeEnabled(true)
        supportActionBar!!.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM)
        supportActionBar!!.setDisplayShowCustomEnabled(true)
        supportActionBar!!.setCustomView(R.layout.action_bar_general)
        val customActionBar = supportActionBar!!.customView
        val showChatStatisticsPage: ImageView = customActionBar
            .findViewById(R.id.showChatGeneral)

        showChatStatisticsPage.setOnClickListener {
            chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        }
        val options = arrayOf("Les statistiques",
            "L'historique de connexion et de déconnexions",
            "L'historique des éditions de dessin")

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

        spinnerOptionsStatisticsPage.adapter = ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, options)
        spinnerOptionsStatisticsPage.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p0: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
                when(p2){
                    0->{
                        statistics.visibility = View.VISIBLE
                        connectionAndDisconnectionHistories.visibility = View.GONE
                        editionHistories.visibility = View.GONE
                    }
                    1->{
                        statistics.visibility = View.GONE
                        connectionAndDisconnectionHistories.visibility = View.VISIBLE
                        editionHistories.visibility = View.GONE
                    }
                    else ->{
                        statistics.visibility = View.GONE
                        connectionAndDisconnectionHistories.visibility = View.GONE
                        editionHistories.visibility = View.VISIBLE
                    }
                }
            }

            @SuppressLint("SetTextI18n")
            override fun onNothingSelected(p0: AdapterView<*>?) {
                statistics.visibility = View.VISIBLE
                connectionAndDisconnectionHistories.visibility = View.GONE
                editionHistories.visibility = View.GONE
            }
        }

        SocketHandler.getChatSocket().on("msgToClient"){ args ->
            if(args[0] != null){
                val messageData = args[0] as String
                val messageFromServer = ClientMessage().fromJson(messageData)
                val roomName = messageFromServer.roomName
                try{
                    chatDialog.chatRoomsFragmentMap[roomName]!!.setMessage(ChatRooms.chats[roomName]!!)
                }
                catch(e: Exception){}
            }
        }
    }
    fun startDrawingActivity(data: String, drawingID: Int){
        val bundle = Bundle()
        bundle.putInt("drawingID", drawingID)
        bundle.putString("drawingInformation", data)
        startActivity(Intent(this, Drawing::class.java).putExtras(bundle))
    }

    fun startJoinProtectedActivity(data: String){
        val bundle = Bundle()
        bundle.putString("drawingInformation", data)
        startActivity(Intent(this, JoinProtected::class.java).putExtras(bundle))
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

    override fun onResume() {
        //maybe change it back to socket later
        val profileRequest = UserProfileRequest(ClientInfo.userId, ClientInfo.userId)
        SocketHandler.getChatSocket().emit("getUserProfileRequest", profileRequest.toJson())
        var i = 0
        SocketHandler.getChatSocket().on("profileToClient"){ args ->
            if(args[0]!=null && i==0){
                val data = args[0] as String
                userInfo = UserProfileInformation().fromJson(data)
                runOnUiThread{
                    updateUI()
                }
                i++
            }
        }
        super.onResume()
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
            viewHolder.itemView.join.isClickable = true
            viewHolder.itemView.join.isEnabled = true
            viewHolder.itemView.join.setOnClickListener {
                if(collaboration!!.drawingVisibility != Visibility.protectedVisibility.int){
                    val drawingID = collaboration!!.drawingId!!
                    val joinRequest = JoinDrawingDto(
                        drawingID,
                        ClientInfo.userId)
                    var i = 0
                    SocketHandler.getChatSocket().emit("joinDrawing", joinRequest.toJson())
                    SocketHandler.getChatSocket().on("drawingInformations") { args ->
                        if (args[0] != null && i == 0) {
                            val data = args[0] as String
                            activity.startDrawingActivity(data, drawingID)
                            i++
                        }
                    }
                    SocketHandler.getChatSocket().on("cantJoinTeam"){ args ->
                        if(args[0]!= null){
                            val data = args[0] as String
                            val cantJoin = CantJoin().fromJson(data)
                            activity.runOnUiThread{
                                Toast.makeText(activity, cantJoin.message,
                                    Toast.LENGTH_SHORT).show()
                            }
                        }
                    }

                }

                else{
                    val drawingData = ReceiveDrawingInformation(id= collaboration!!.drawingId,
                        name=collaboration!!.drawingName)
                    activity.startJoinProtectedActivity(drawingData.toJson())
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
