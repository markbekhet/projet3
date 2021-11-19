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
import com.example.android.chat.*
import com.example.android.client.ActiveUser
import com.example.android.client.ClientInfo
import com.example.android.client.User
import com.example.android.client.UsersArrayList
import io.socket.client.Socket
import kotlinx.android.synthetic.main.activity_team.*

class TeamActivity : AppCompatActivity() {
    private val chatRoomsFragmentMap = HashMap<String, Chat>()
    private var chatFragmentTransaction: FragmentTransaction? = null
    private var teamGeneralInformation: TeamGeneralInformation?= null
    private var manager: FragmentManager?=null
    private var socket: Socket?= null
    private var chatRoomExists = false
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_team)
        socket = SocketHandler.getChatSocket()
        val usersList =  ArrayList<User>()
        //The extra data will be needed for the gallery and for the chat

        /*===============Get the team information from the bundle==================*/
        val data = intent.extras!!.getString("teamInformation")
        val teamChatAndActiveUsers = TeamChatAndActiveUsers().fromJson(data!!)
        println(teamChatAndActiveUsers.activeUsers.size)
        for(userId in teamChatAndActiveUsers.activeUsers){
            for(userInformation in ClientInfo.usersList.userList!!){
                if(userId.userId == userInformation.id){
                    usersList.add(userInformation)
                    break
                }
            }
        }

        val generalData = intent.extras!!.getString("teamGeneralInformation")
        teamGeneralInformation = TeamGeneralInformation().fromJson(generalData!!)
        ChatRooms.chats[teamGeneralInformation!!.name!!] = teamChatAndActiveUsers.chatHistoryList
        val chatDialog = ChatDialog(this, teamGeneralInformation!!.name!!)

        chatRoomExists = ChatRooms.chatRooNames.contains(teamGeneralInformation!!.name!!)
        chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        try{
            chatDialog.setPreviousMessages(teamGeneralInformation!!.name!!)
        } catch(e: Exception){}

        teamNameTeamActivity.text = teamGeneralInformation!!.name
        createDrawingTeamButton.setOnClickListener{
            startActivity(Intent(this, CreateDraw::class.java))
        }

        showChatTeamPage.setOnClickListener {
            chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        }

        /*================Fragments section=================================*/
        manager = supportFragmentManager
        val usersFragmentTransaction = manager!!.beginTransaction()
        val usersAndTeamsFragment = UsersAndTeamsFragment()
        usersAndTeamsFragment.setUsersList(usersList)

        usersFragmentTransaction.replace(R.id.usersAndTeamsFrameTeamPage, usersAndTeamsFragment).commit()


        //A hash map that has all the fragments

        /*========================socket actions=================================*/
        socket?.on("newJoinToTeam"){ args ->
            if(args[0]!= null){
                val newActiveUserData = args[0] as String
                val newActiveUser = ActiveUser().fromJson(newActiveUserData)
                var newActiveUserInformation = User()
                for(existingUser in ClientInfo.usersList.userList!!){
                    if(existingUser.id == newActiveUser.userId){
                        println("${existingUser.pseudo} has joined ${teamGeneralInformation!!.name}")
                        newActiveUserInformation = existingUser
                        break
                    }
                }
                usersList.add(newActiveUserInformation)
                usersAndTeamsFragment.setUsersList(usersList)

            }

        }

        socket?.on("userLeftTeam"){ args ->
            if(args[0]!= null){
                val userLeftData = args[0] as String
                val userLeft = ActiveUser().fromJson(userLeftData)
                var i = 0
                for(existingUsers in usersList){
                    if(existingUsers.id == userLeft.userId){
                        println("user ${existingUsers.pseudo} has left the iterator = $i")
                        break
                    }
                    i++
                }
                usersList.removeAt(i)
                usersAndTeamsFragment.setUsersList(usersList)
            }
        }

        socket?.on("userUpdate"){ args ->
            if(args[0]!= null){
                val userUpdated = User().fromJson(args[0] as String)
                var exist = false
                var i = 0
                for(existingUser in usersList){
                    println(usersList.size)
                    if(existingUser.id == userUpdated.id){
                        exist = true
                        break
                    }
                    i++
                }
                if(exist){
                    usersList.removeAt(i)
                    usersList.add(userUpdated)
                    usersAndTeamsFragment.setUsersList(usersList)
                }
            }
        }

        socket?.on("teamDeleted"){ args ->
            if(args[0] != null){
                usersAndTeamsFragment.updateTeamsRecycleView()
            }
        }

        socket?.on("newTeamCreated"){ args ->
            if(args[0] != null){
                usersAndTeamsFragment.updateTeamsRecycleView()
            }
        }
    }

    override fun onDestroy() {
        if(!chatRoomExists){
            ChatRooms.chats.remove(teamGeneralInformation!!.name)
            var i = 0
            for(room in ChatRooms.chatRooNames){
                if(room == teamGeneralInformation!!.name){
                    break
                }
                i++
            }
            ChatRooms.chatRooNames.removeAt(i)
        }

        val leaveTeam = LeaveTeamDto(teamGeneralInformation!!.name, ClientInfo.userId)
        SocketHandler.getChatSocket().emit("leaveTeam", leaveTeam.toJson())
        super.onDestroy()
    }
}
