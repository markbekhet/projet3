package com.example.android.team

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentTransaction
import com.example.android.CreateDraw
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.UsersAndTeamsFragment
import com.example.android.chat.Chat
import com.example.android.chat.ChatRoomSwitcher
import com.example.android.chat.ChatRooms
import com.example.android.chat.ChatSwitchFragment
import com.example.android.client.ClientInfo
import com.example.android.client.UsersArrayList
import kotlinx.android.synthetic.main.activity_team.*

class TeamActivity : AppCompatActivity(), ChatRoomSwitcher {
    private val chatRoomsFragmentMap = HashMap<String, Chat>()
    private var chatFragmentTransaction: FragmentTransaction? = null
    private var teamGeneralInformation: TeamGeneralInformation?= null
    private var manager: FragmentManager?=null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_team)
        //The extra data will be needed for the gallery and for the chat

        val data = intent.extras!!.getString("teamInformation")
        val generalData = intent.extras!!.getString("teamGeneralInformation")
        teamGeneralInformation = TeamGeneralInformation().fromJson(generalData!!)
        ChatRooms.chatRooNames.add(teamGeneralInformation!!.name!!)

        teamNameTeamActivity.text = teamGeneralInformation!!.name
        createDrawingTeamButton.setOnClickListener{
            startActivity(Intent(this, CreateDraw::class.java))
        }
        manager = supportFragmentManager
        val usersFragmentTransaction = manager!!.beginTransaction()
        val usersAndTeamsFragment = UsersAndTeamsFragment()

        usersFragmentTransaction.replace(R.id.usersAndTeamsFrameTeamPage, usersAndTeamsFragment).commit()
        var usersList =  UsersArrayList()

        //A hash map that has all the fragments

        val chatSwitchFragmentTransaction = manager!!.beginTransaction()
        val chatSwitchFragment = ChatSwitchFragment(this)
        chatSwitchFragment.showChatSwitch()
        chatSwitchFragmentTransaction.replace(R.id.teamPageChatSwitch,
            chatSwitchFragment).commit()

        for(room in ChatRooms.chatRooNames){
            chatRoomsFragmentMap[room] = Chat(room)
        }

        chatFragmentTransaction = manager!!.beginTransaction()
        chatFragmentTransaction!!.replace(R.id.teamPageChatsFrame,
            chatRoomsFragmentMap[teamGeneralInformation!!.name]!!).commit()
    }

    override fun onDestroy() {
        val leaveTeam = LeaveTeamDto(teamGeneralInformation!!.name, ClientInfo.userId)
        SocketHandler.getChatSocket().emit("leaveTeam", leaveTeam.toJson())
        super.onDestroy()
    }
    override fun switchChatRoom(name: String) {
        if(chatFragmentTransaction != null){
            println("I am here fragment must switch to $name")
            chatFragmentTransaction = manager!!.beginTransaction()
            chatFragmentTransaction!!.replace(R.id.teamPageChatsFrame,
                chatRoomsFragmentMap[name]!!).commit()
        }
    }
}
