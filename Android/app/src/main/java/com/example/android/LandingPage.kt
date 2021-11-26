package com.example.android

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.android.chat.*
import com.example.android.canvas.GalleryDrawing
import com.example.android.canvas.ModifyDrawingDto
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.client.*
import com.example.android.profile.OwnProfile
import com.example.android.team.*
import com.google.gson.Gson
import io.socket.client.Socket
import kotlinx.android.synthetic.main.content_landing_page.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response

class LandingPage : AppCompatActivity(){
    private var clientService = ClientService()
    private var chatSocket: Socket? = null

    var response: Response<ResponseBody>?=null
    private val galleryDraws = Gallery()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.content_landing_page)
        val clientService = ClientService()
        //Initialize chat socket
        val manager = supportFragmentManager
        val chatDialog = ChatDialog(this, "General")
        chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        chatDialog.dismiss()

        SocketHandler.setChatSocket()
        SocketHandler.establishChatSocketConnection()
        val galleryFragmentTransaction = manager.beginTransaction()
        galleryFragmentTransaction.replace(R.id.gallery_frame, galleryDraws).commit()


        runBlocking {
            async{
                launch {
                    response = clientService.getUserGallery()
                }
            }
        }
        if(response!!.isSuccessful){
            val data = response!!.body()!!.string()
            ClientInfo.gallery = GalleryDrawing().fromJson(data)

            galleryDraws.set(ClientInfo.gallery.drawingList)
        }
        chatSocket = SocketHandler.getChatSocket()
        val usersFragmentTransaction = manager.beginTransaction()
        val usersAndTeamsFragment = UsersAndTeamsFragment()

        usersFragmentTransaction.replace(R.id.usersAndTeamsFrameLandingPage, usersAndTeamsFragment).commit()

        //A hash map that has all the fragments



/*======================Socket interactions==================================*/
        chatSocket?.on("usersArrayToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                ClientInfo.usersList = Gson().fromJson(data, UsersArrayList::class.java)
                usersAndTeamsFragment.setUsersList(ClientInfo.usersList.userList)
            }
        }

        chatSocket?.on("teamsArrayToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                ClientInfo.teamsList = Gson().fromJson(data, TeamsArrayList::class.java)
                usersAndTeamsFragment.setTeamsList()
            }
        }

        chatSocket?.on("drawingDeleted"){ args->
            if(args[0] != null){
                val data = args[0] as String
                val deletedDrawing = ReceiveDrawingInformation().fromJson(data)
                ClientInfo.gallery.deleteExistingDrawing(deletedDrawing)
                galleryDraws.set(ClientInfo.gallery.drawingList)
            }
        }

        chatSocket?.on("drawingModified"){ args->
            if(args[0] != null){
                val data = args[0] as String
                val drawingModified = ReceiveDrawingInformation().fromJson(data)
                ClientInfo.gallery.modifyDrawing(drawingModified, ClientInfo.userId)
                galleryDraws.set(ClientInfo.gallery.drawingList)
            }
        }

        chatSocket?.on("newDrawingCreated"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val drawingAdded = ReceiveDrawingInformation().fromJson(data)
                ClientInfo.gallery.addNewCreatedDrawing(drawingAdded, ClientInfo.userId)
                galleryDraws.set(ClientInfo.gallery.drawingList)
            }
        }

        chatSocket?.on("nbCollaboratorsDrawingIncreased"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val drawing = ModifyDrawingDto().fromJson(data)
                ClientInfo.gallery.increaseNbCollaborator(drawing)
                galleryDraws.set(ClientInfo.gallery.drawingList)
            }
        }

        chatSocket?.on("nbCollaboratorsDrawingReduced"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val drawing = ModifyDrawingDto().fromJson(data)
                ClientInfo.gallery.decreaseNbCollaborator(drawing)
                galleryDraws.set(ClientInfo.gallery.drawingList)
            }
        }
        chatSocket?.on("RoomChatHistories"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val generalChatList = ClientMessageArray().fromJson(data)
                ChatRooms.chats["General"] = generalChatList.chatHistoryList!!
                try{
                    chatDialog.setPreviousMessages("General")
                } catch(e: Exception){}
            }
        }

        SocketHandler.getChatSocket().on("msgToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val messageFromServer = ClientMessage().fromJson(data)
                val roomName = messageFromServer.roomName
                try{
                    // This must be the only place where the add is called in order
                        // for the message to be unique in the array list
                    ChatRooms.chats[roomName]!!.add(messageFromServer)
                    chatDialog.chatRoomsFragmentMap[roomName]!!.setMessage(ChatRooms.chats[roomName]!!)
                }
                catch(e: Exception){}
            }
        }

        //This code happens once here for the genral chat room
        chatSocket?.on("userUpdate"){ args ->
            if(args[0]!= null){
                val userUpdated = User().fromJson(args[0] as String)
                var exist = false
                var i = 0
                for(existingUser in ClientInfo.usersList.userList){
                    if(existingUser.id == userUpdated.id){
                        exist = true
                        break
                    }
                    i++
                }
                if(exist){
                    ClientInfo.usersList.userList.removeAt(i)
                }
                ClientInfo.usersList.userList.add(userUpdated)
            }
            try{
                usersAndTeamsFragment.setUsersList(ClientInfo.usersList.userList)
            }catch(e: Exception){}
        }


        socketUpdatesForUsersAndTeam(chatSocket, usersAndTeamsFragment)
        /*========================================================================================*/

        /*==================Buttons actions=====================================================*/
        profileButton.setOnClickListener {
            val profileRequest = UserProfileRequest(ClientInfo.userId, ClientInfo.userId)
            chatSocket!!.emit("getUserProfileRequest", profileRequest.toJson())
            var i = 0
            chatSocket!!.on("profileToClient"){ args ->
                if(args[0]!=null && i==0){
                    val data = args[0] as String
                    val bundle = Bundle()

                    bundle.putString("profileInformation", data)
                    startActivity(Intent(this, OwnProfile::class.java).putExtras(bundle))
                    i++
                }
            }
        }

        createDrawingHomeButton.setOnClickListener{
            startActivity(Intent(this, CreateDraw::class.java))
        }

        createTeamHomeButton.setOnClickListener {
            val createTeamDialog = CreateCollaborationTeamDialog(this)
            createTeamDialog.create()
            createTeamDialog.show()
        }

        disconnect.setOnClickListener {
            disconnect()
            finishAndRemoveTask()
        }

        showChat.setOnClickListener {
            chatDialog.show(manager, ChatDialog.TAG)
        }
        /*=======================================================================================*/
    }

    fun disconnect(){
        runBlocking{
            launch{
                clientService.disconnect()
            }

        }
        ChatRooms.chats.clear()
        ChatRooms.chatRooNames.clear()
        chatSocket?.disconnect()
    }

    override fun onDestroy() {
        try{
            disconnect()
            ChatRooms.chats.clear()
            ChatRooms.chatRooNames.clear()
            ClientInfo.possibleOwners.clear()
            ClientInfo.gallery.drawingList.clear()
            ClientInfo.indexPossibleOwners = 0
        } catch(e: Exception){}
        super.onDestroy()
    }

    override fun onBackPressed() {
        disconnect()
        ChatRooms.chats.clear()
        ChatRooms.chatRooNames.clear()
        ClientInfo.possibleOwners.clear()
        ClientInfo.gallery.drawingList.clear()
        ClientInfo.indexPossibleOwners = 0
        super.onBackPressed()
    }

    override fun onRestart() {
        runBlocking {
            async{
                launch {
                    response = clientService.getUserGallery()
                }
            }
        }
        if(response!!.isSuccessful){
            val data = response!!.body()!!.string()
            ClientInfo.gallery = GalleryDrawing().fromJson(data)

            galleryDraws.set(ClientInfo.gallery.drawingList)
        }
        super.onRestart()
    }
}

//To add a similar method for the gallery
fun socketUpdatesForUsersAndTeam(socket:Socket?,
                                 fragment: UsersAndTeamsFragment){

    socket?.on("teamDeleted"){ args ->
        if(args[0] != null){
            val data = args[0] as String
            val team = TeamGeneralInformation().fromJson(data)
            fragment.removeTeam(team)
        }
    }
    socket?.on("newTeamCreated"){ args ->
        if(args[0] != null){
            val data = args[0] as String
            val team = TeamGeneralInformation().fromJson(data)
            fragment.addTeam(team)
        }
    }
}
