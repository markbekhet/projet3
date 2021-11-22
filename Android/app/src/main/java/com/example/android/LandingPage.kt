package com.example.android

import android.annotation.SuppressLint
import android.app.Dialog
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.widget.doAfterTextChanged
import com.example.android.canvas.Visibility
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
import kotlinx.android.synthetic.main.popup_create_collaboration_team.*
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
                usersAndTeamsFragment.setUsersList(ClientInfo.usersList.userList!!)
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
                if(ClientInfo.usersList.userList != null){
                    var exist = false
                    var i = 0
                    for(existingUser in ClientInfo.usersList.userList!!){
                        if(existingUser.id == userUpdated.id){
                            exist = true
                            break
                        }
                        i++
                    }
                    if(exist){
                        ClientInfo.usersList.userList!!.removeAt(i)
                    }
                    ClientInfo.usersList.userList!!.add(userUpdated)
                }
                try{
                    usersAndTeamsFragment.setUsersList(ClientInfo.usersList.userList!!)
                }catch(e: Exception){}
            }

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

    fun startTeamActivity(teamsGeneralInformation: TeamGeneralInformation,data:String){
        val bundle = Bundle()
        bundle.putString("teamInformation", data)
        bundle.putString("teamGeneralInformation", teamsGeneralInformation.toJson())
        startActivity(Intent(this, TeamActivity::class.java).putExtras(bundle))
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

    override fun onResume() {
        galleryDraws.set(ClientInfo.gallery.drawingList)
        super.onResume()
    }

    /*override fun onPause(){
        SocketHandler.getChatSocket().on("msgToClient"){ args ->
            if(args[0] != null) {
                val data = args[0] as String
                val messageFromServer = ClientMessage().fromJson(data)
                try {
                    val notificationManager = ContextCompat.getSystemService(
                        this,
                        NotificationManager::class.java
                    ) as NotificationManager
                    notificationManager.sendNotification(
                        messageFromServer.message!!,
                        this
                    )
                } catch (e: Exception) {
                }
            }
        }
        super.onPause()
    }*/
}


internal class CreateCollaborationTeamDialog(var context: LandingPage): Dialog(context){
    private var createTeamDto = CreateTeamDto()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.popup_create_collaboration_team)
        val option:Spinner = findViewById(R.id.spOptionTeam)
        val result:TextView = findViewById(R.id.resultTeamVisibility)
        val clientService = ClientService()

        val options = arrayOf("publique", "protegée")
        option.adapter = ArrayAdapter<String>(context, android.R.layout.simple_list_item_1, options)
        option.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p0: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
                result.text = options[p2]
                createTeamDto.visibility = p2
                if (p2 == 1) {
                    teamPassword.visibility = View.VISIBLE
                } else {
                    teamPassword.visibility = View.INVISIBLE
                }
            }

            @SuppressLint("SetTextI18n")
            override fun onNothingSelected(p0: AdapterView<*>?) {
                resultTeamVisibility.text = options[0]
                createTeamDto.visibility = 0
            }
        }

        teamName.doAfterTextChanged {
            if (!isNotBlank()) {
                createTeam.isEnabled = false
                createTeam.isClickable = false
            } else {
                createTeam.isEnabled = true
                createTeam.isClickable = true
            }
            errorTeam.text = ""
        }

        nbCollaborators.doAfterTextChanged {
            if (!isNotBlank()) {
                createTeam.isEnabled = false
                createTeam.isClickable = false
            } else {
                createTeam.isEnabled = true
                createTeam.isClickable = true
            }
            errorTeam.text = ""
        }

        createTeam?.setOnClickListener() {
            var canProcessQuery = true
            if (createTeamDto.visibility == Visibility.protectedVisibility.int) {
                if (teamPassword.text.isBlank() || teamPassword.text.isEmpty()) {
                    canProcessQuery = false
                    errorTeam.text = "Le mot de passe est obligatoire et" +
                        " ne peut pas être composé seulemwnt d'espaces quand le dessin est protégé"
                } else {
                    createTeamDto.password = teamPassword.text.toString()
                    println(createTeamDto.password)
                }
            } else {
                createTeamDto.password = null
            }

            createTeamDto.nbCollaborators = nbCollaborators.text.toString().toInt()
            createTeamDto.name = teamName.text.toString()
            createTeamDto.ownerId = ClientInfo.userId

            println(createTeamDto.password)
            teamPassword.text.clear()
            nbCollaborators.text.clear()
            teamName.text.clear()

            if (canProcessQuery) {
                var response: Response<ResponseBody>? = null
                runBlocking {
                    async {
                        launch {
                            response = clientService.createCollaborationTeam(createTeamDto)
                        }
                    }
                }
                if (response!!.isSuccessful) {
                    val data = response!!.body()!!.string()
                    val teamGeneralInformation = TeamGeneralInformation().fromJson(data)
                    val joinTeam = JoinTeamDto(
                        teamName = createTeamDto.name,
                        userId = createTeamDto.ownerId,
                        password = createTeamDto.password)
                    var i = 0
                    SocketHandler.getChatSocket().emit("joinTeam", joinTeam.toJson())
                    SocketHandler.getChatSocket().on("teamInformations"){ args ->
                        if(args[0]!= null && i==0){
                            //ToComplete: Collect the rest of information concerning
                                // the team like the gallery and the list of users
                            val extraData = args[0] as String
                            context.startTeamActivity(teamGeneralInformation,extraData)
                            i++
                            dismiss()
                        }
                    }

                } else {
                    context.runOnUiThread{
                        Toast.makeText(context, response!!.errorBody()!!.string(),
                            Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }

    }

    private fun isNotBlank(): Boolean{
        if(teamName.text.isBlank() || nbCollaborators.text.isBlank()){
            return false
        }
        return true
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
