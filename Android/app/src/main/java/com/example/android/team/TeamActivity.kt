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

class TeamActivity : AppCompatActivity(), ChatRoomSwitcher {
    private val chatRoomsFragmentMap = HashMap<String, Chat>()
    private var chatFragmentTransaction: FragmentTransaction? = null
    private var teamGeneralInformation: TeamGeneralInformation?= null
    private var manager: FragmentManager?=null
    private var socket: Socket?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_team)
        socket = SocketHandler.getChatSocket()
        var usersList =  ArrayList<User>()
        //The extra data will be needed for the gallery and for the chat

        /*===============Get the team information from the bundle==================*/
        val data = intent.extras!!.getString("teamInformation")
        val teamChatAndActiveUsers = TeamChatAndActiveUsers().fromJson(data!!)
        println(teamChatAndActiveUsers.activeUsers.size)
        for(userId in teamChatAndActiveUsers.activeUsers){
            for(userInformation in ClientInfo.usersList.userList!!){
                if(userId.userId == userInformation.id){
                    usersList.add(userInformation)
                }
            }
        }

        val generalData = intent.extras!!.getString("teamGeneralInformation")
        teamGeneralInformation = TeamGeneralInformation().fromJson(generalData!!)
        ChatRooms.chats[teamGeneralInformation!!.name!!] = teamChatAndActiveUsers.chatHistoryList


        ChatRooms.chatRooNames.add(teamGeneralInformation!!.name!!)

        teamNameTeamActivity.text = teamGeneralInformation!!.name
        createDrawingTeamButton.setOnClickListener{
            startActivity(Intent(this, CreateDraw::class.java))
        }

        /*================Fragments section=================================*/
        manager = supportFragmentManager
        val usersFragmentTransaction = manager!!.beginTransaction()
        val usersAndTeamsFragment = UsersAndTeamsFragment()
        usersAndTeamsFragment.setUsersList(usersList)

        usersFragmentTransaction.replace(R.id.usersAndTeamsFrameTeamPage, usersAndTeamsFragment).commit()


        //A hash map that has all the fragments

        val chatSwitchFragmentTransaction = manager!!.beginTransaction()
        val chatSwitchFragment = ChatSwitchFragment(this)
        chatSwitchFragment.showChatSwitch()
        chatSwitchFragmentTransaction.replace(R.id.teamPageChatSwitch,
            chatSwitchFragment).commit()

        for(room in ChatRooms.chatRooNames){
            val chatRoom = Chat(room)
            chatRoom.setMessage(ChatRooms.chats[room]!!)
            chatRoomsFragmentMap[room] = chatRoom

        }
        chatFragmentTransaction = manager!!.beginTransaction()
        chatFragmentTransaction!!.replace(R.id.teamPageChatsFrame,
            chatRoomsFragmentMap[teamGeneralInformation!!.name]!!).commit()

        /*========================socket actions=================================*/
        socket?.on("msgToClient") { args ->
            if (args[0] != null) {
                val messageData = args[0] as String
                val messageFromServer = ClientMessage().fromJson(messageData)
                val roomName = messageFromServer.roomName
                // Each team and drawing will add its own information from the socket
                // If not we will have duplicated of messages in the singleton
                if(roomName == teamGeneralInformation!!.name){
                    ChatRooms.chats[roomName]!!.add(messageFromServer)
                }
                try{
                    chatRoomsFragmentMap[roomName]!!.setMessage(ChatRooms.chats[roomName]!!)
                }catch(e:Exception){}
            }
        }

        socket?.on("newJoinToTeam"){ args ->
            if(args[0]!= null){
                val newActiveUserData = args[0] as String
                val newActiveUser = ActiveUser().fromJson(newActiveUserData)
                var newActiveUserInformation = User()
                for(existingUser in ClientInfo.usersList.userList!!){
                    if(existingUser.id == newActiveUser.userId){
                        newActiveUserInformation = existingUser
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
        ChatRooms.chats.remove(teamGeneralInformation!!.name)
        var i = 0
        for(room in ChatRooms.chatRooNames){
            if(room == teamGeneralInformation!!.name){
                break
            }
            i++
        }
        ChatRooms.chatRooNames.removeAt(i)

        val leaveTeam = LeaveTeamDto(teamGeneralInformation!!.name, ClientInfo.userId)
        SocketHandler.getChatSocket().emit("leaveTeam", leaveTeam.toJson())
        super.onDestroy()
    }
    override fun switchChatRoom(name: String) {
        if(chatFragmentTransaction != null){
            chatFragmentTransaction = manager!!.beginTransaction()
            chatFragmentTransaction!!.replace(R.id.teamPageChatsFrame,
                chatRoomsFragmentMap[name]!!).commit()
        }
    }
}
