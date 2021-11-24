package com.example.android.team

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentTransaction
import com.example.android.*
import com.example.android.canvas.ModifyDrawingDto
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.canvas.Visibility
import com.example.android.chat.*
import com.example.android.client.*
import com.example.android.profile.OwnProfile
import io.socket.client.Socket
import kotlinx.android.synthetic.main.activity_team.*
import kotlinx.android.synthetic.main.content_landing_page.*

class TeamActivity : AppCompatActivity() {
    private var teamGeneralInformation: TeamGeneralInformation?= null
    private var manager: FragmentManager?=null
    private var socket: Socket?= null
    private var chatRoomExists = false
    val galleryDrawings = Gallery()

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
            for(userInformation in ClientInfo.usersList.userList){
                if(userId.userId == userInformation.id){
                    usersList.add(userInformation)
                    break
                }
            }
        }

        val generalData = intent.extras!!.getString("teamGeneralInformation")
        teamGeneralInformation = TeamGeneralInformation().fromJson(generalData!!)
        ChatRooms.chats[teamGeneralInformation!!.name!!] = teamChatAndActiveUsers.chatHistoryList

        chatRoomExists = ChatRooms.chatRooNames.contains(teamGeneralInformation!!.name!!)
        val chatDialog = ChatDialog(this, teamGeneralInformation!!.name!!)

        //chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        //chatDialog.dismiss()
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


        //make sure that is the first time to visit the team
        if(!chatRoomExists){
            ClientInfo.gallery.addDrawingsToList(teamChatAndActiveUsers.drawingList)
            ClientInfo.indexPossibleOwners++
            val pair = Pair<String, String>(teamGeneralInformation!!.id!!, teamGeneralInformation!!.name!!)
            ClientInfo.possibleOwners[ClientInfo.indexPossibleOwners] = pair
        }
        galleryDrawings.set(ClientInfo.gallery.drawingList)

        val galleryFragmentTransaction = manager!!.beginTransaction()
        galleryFragmentTransaction.replace(R.id.galleryFrameTeamPage, galleryDrawings).commit()

        //A hash map that has all the fragments

        /*==========================================*/
        /*======Buttons=============================*/
        createTeamTeamButton.setOnClickListener {
            val createTeamDialog = CreateCollaborationTeamDialog(this)
            createTeamDialog.create()
            createTeamDialog.show()
        }

        profileButtonTeamPage.setOnClickListener {
            val profileRequest = UserProfileRequest(ClientInfo.userId, ClientInfo.userId)
            socket!!.emit("getUserProfileRequest", profileRequest.toJson())
            var i = 0
            socket!!.on("profileToClient"){ args ->
                if(args[0]!=null && i==0){
                    val profileData = args[0] as String
                    val bundle = Bundle()

                    bundle.putString("profileInformation", profileData)
                    startActivity(Intent(this, OwnProfile::class.java).putExtras(bundle))
                    i++
                }
            }
        }
        /*============================================*/
        /*========================socket actions=================================*/
        socket?.on("newJoinToTeam"){ args ->
            if(args[0]!= null){
                val newActiveUserData = args[0] as String
                val newActiveUser = ActiveUser().fromJson(newActiveUserData)
                if(newActiveUser.teamName == teamGeneralInformation!!.name){
                    var newActiveUserInformation = User()
                    for(existingUser in ClientInfo.usersList.userList){
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

        }

        socket?.on("userLeftTeam"){ args ->
            if(args[0]!= null){
                val userLeftData = args[0] as String
                val userLeft = ActiveUser().fromJson(userLeftData)
                if(userLeft.teamName == teamGeneralInformation!!.name){
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
        }

        SocketHandler.getChatSocket().on("msgToClient"){ args ->
            if(args[0] != null){
                val messageData = args[0] as String
                val messageFromServer = ClientMessage().fromJson(messageData)
                val roomName = messageFromServer.roomName
                try{
                    //The message is being added from the landing page activity
                    chatDialog.chatRoomsFragmentMap[roomName]!!.setMessage(ChatRooms.chats[roomName]!!)
                }
                catch(e: Exception){}
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

        /*============Gallery related socket interaction================*/
        socket?.on("drawingDeleted"){ args->
            if(args[0] != null){
                galleryDrawings.set(ClientInfo.gallery.drawingList)
            }
        }

        socket?.on("drawingModified"){ args->
            if(args[0] != null){
                val drawingModData = args[0] as String
                val drawingModified = ReceiveDrawingInformation().fromJson(drawingModData)
                if(isPrivateToTeam(drawingModified) && ! chatRoomExists){
                    ClientInfo.gallery.modifyDrawing(drawingModified, teamGeneralInformation!!.id!!)
                }
                galleryDrawings.set(ClientInfo.gallery.drawingList)
            }
        }

        socket?.on("newDrawingCreated"){ args ->
            if(args[0] != null){
                val newDrawing = args[0] as String
                val drawingAdded = ReceiveDrawingInformation().fromJson(newDrawing)
                if(isPrivateToTeam(drawingAdded) && !chatRoomExists){
                    ClientInfo.gallery.addNewCreatedDrawing(drawingAdded, teamGeneralInformation!!.id!!)
                }
                galleryDrawings.set(ClientInfo.gallery.drawingList)
            }
        }

        socket?.on("nbCollaboratorsDrawingIncreased"){ args ->
            if(args[0] != null){
                galleryDrawings.set(ClientInfo.gallery.drawingList)
            }
        }

        socket?.on("nbCollaboratorsDrawingReduced"){ args ->
            if(args[0] != null){
                galleryDrawings.set(ClientInfo.gallery.drawingList)
            }
        }
    }

    fun isPrivateToTeam(drawing: ReceiveDrawingInformation): Boolean{
        if(drawing.ownerId == teamGeneralInformation!!.id!!
            && drawing.visibility == Visibility.privateVisibility.int){
            return true
        }
        return false
    }

    override fun onBackPressed() {
        if(!chatRoomExists){
            ClientInfo.gallery.removeDrawingsTeam(teamGeneralInformation!!.id!!)
            ChatRooms.chats.remove(teamGeneralInformation!!.name)
            var i = 0
            for(room in ChatRooms.chatRooNames){
                if(room == teamGeneralInformation!!.name){
                    break
                }
                i++
            }
            ClientInfo.possibleOwners.remove(ClientInfo.indexPossibleOwners)
            ClientInfo.indexPossibleOwners--
            ChatRooms.chatRooNames.removeAt(i)
        }

        val leaveTeam = LeaveTeamDto(teamGeneralInformation!!.name, ClientInfo.userId)
        SocketHandler.getChatSocket().emit("leaveTeam", leaveTeam.toJson())
        super.onBackPressed()
    }

    override fun onResume(){
        galleryDrawings.set(ClientInfo.gallery.drawingList)
        super.onResume()
    }
}
