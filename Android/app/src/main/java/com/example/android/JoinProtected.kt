package com.example.android

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import androidx.core.widget.doAfterTextChanged
import com.example.android.canvas.JoinDrawingDto
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.chat.ChatDialog
import com.example.android.chat.ChatRooms
import com.example.android.chat.ClientMessage
import com.example.android.client.ClientInfo
import com.example.android.team.CantJoin
import com.example.android.team.JoinTeamDto
import com.example.android.team.TeamActivity
import com.example.android.team.TeamGeneralInformation
import kotlinx.android.synthetic.main.activity_join_protected.*

class JoinProtected : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_join_protected)
        val drawingData = intent.extras!!.getString("drawingInformation")
        val teamData = intent.extras!!.getString("teamInformation")

        val manager = supportFragmentManager
        val chatDialog = ChatDialog(this)
        chatJoinProtected.setOnClickListener {
            chatDialog.show(manager, ChatDialog.TAG)
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

        if(drawingData != null){
            val receiveDrawingInformation = ReceiveDrawingInformation().fromJson(drawingData)
            joinProtectedLabel.text = "Joindre le dessin" +
                " protégé ${receiveDrawingInformation!!.name}"

            val joinDrawingDto = JoinDrawingDto(drawingId = receiveDrawingInformation.id!!,
            userId= ClientInfo.userId)

            joinProtectedTextPassword.doAfterTextChanged {
                if(joinProtectedTextPassword.text.isNotEmpty()){
                    joinProtected.isClickable = true
                    joinProtected.isEnabled = true
                }
                else{
                    joinProtected.isEnabled = false
                    joinProtected.isClickable = false
                }
                joinDrawingDto.password = joinProtectedTextPassword.text.toString()
            }

            joinProtected.setOnClickListener {
                joinProtectedTextPassword.text.clear()
                var i = 0
                SocketHandler.getChatSocket().emit("joinDrawing", joinDrawingDto.toJson())
                SocketHandler.getChatSocket().on("drawingInformations"){ args ->
                    if(args[0]!=null && i == 0){
                        val data = args[0] as String
                        val bundle = Bundle()
                        bundle.putString("drawingInformation", data)
                        bundle.putInt("drawingID", receiveDrawingInformation.id!!)
                        startActivity(Intent(this, Drawing::class.java).putExtras(bundle))
                        i++
                        finish()
                    }
                }
                SocketHandler.getChatSocket().on("cantJoinDrawing"){ args ->
                    if(args[0]!= null){
                        val data = args[0] as String
                        val cantJoin = CantJoin().fromJson(data)
                        runOnUiThread{
                            Toast.makeText(this, cantJoin.message, Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }

        }

        else if(teamData != null){
            val teamGeneralInformation = TeamGeneralInformation().fromJson(teamData)
            joinProtectedLabel.text = "Joindre l'équipe protégée ${teamGeneralInformation.name}"

            val joinTeamDto = JoinTeamDto(teamName = teamGeneralInformation.name,
                userId = ClientInfo.userId)

            joinProtectedTextPassword.doAfterTextChanged {
                if(joinProtectedTextPassword.text.isNotEmpty()){
                    joinProtected.isClickable = true
                    joinProtected.isEnabled = true
                }
                else{
                    joinProtected.isEnabled = false
                    joinProtected.isClickable = false
                }
                //joinTeamDto.password = joinProtectedTextPassword.text.toString()
            }

            joinProtected.setOnClickListener {
                joinTeamDto.password = joinProtectedTextPassword.text.toString()
                println(joinTeamDto.password)
                joinProtectedTextPassword.text.clear()
                var i = 0
                SocketHandler.getChatSocket().emit("joinTeam", joinTeamDto.toJson())
                SocketHandler.getChatSocket().on("teamInformations"){ args ->
                    if(args[0]!=null && i == 0){
                        val data = args[0] as String
                        val bundle = Bundle()
                        bundle.putString("teamInformation", data)
                        bundle.putString("teamGeneralInformation", teamGeneralInformation.toJson())
                        startActivity(Intent(this,
                            TeamActivity::class.java).putExtras(bundle))
                        i++
                        finish()
                    }
                }
                SocketHandler.getChatSocket().on("cantJoinTeam"){ args ->
                    if(args[0]!= null){
                        val data = args[0] as String
                        val cantJoin = CantJoin().fromJson(data)
                        runOnUiThread{
                            Toast.makeText(this, cantJoin.message, Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }
        }
    }
}
