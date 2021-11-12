package com.example.android.team

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.android.CreateDraw
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.client.ClientInfo
import kotlinx.android.synthetic.main.activity_team.*

class TeamActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_team)
        //The extra data will be needed for the gallery and for the chat
        val data = intent.extras!!.getString("teamInformation")
        teamNameTeamActivity.text = TeamUtils.currentTeam.name
        createDrawingTeamButton.setOnClickListener{
            startActivity(Intent(this, CreateDraw::class.java))
        }
    }

    override fun onDestroy() {
        val leaveTeam = LeaveTeamDto(TeamUtils.currentTeam.name, ClientInfo.userId)
        SocketHandler.getChatSocket().emit("leaveTeam", leaveTeam.toJson())
        super.onDestroy()
    }
}
