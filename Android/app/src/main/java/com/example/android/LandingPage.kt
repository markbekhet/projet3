package com.example.android

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.doAfterTextChanged
import com.example.android.canvas.DrawingUtils
import com.example.android.canvas.JoinDrawingDto
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.canvas.Visibility
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import com.example.android.client.TeamsArrayList
import com.example.android.client.UsersArrayList
import com.example.android.profile.OwnProfile
import com.example.android.profile.clientService
import com.example.android.team.CreateTeamDto
import com.example.android.team.JoinTeamDto
import com.example.android.team.TeamGeneralInformation
import com.example.android.team.TeamUtils
import com.google.gson.Gson
import io.socket.client.Socket
import kotlinx.android.synthetic.main.content_landing_page.*
import kotlinx.android.synthetic.main.createdraw.*
import kotlinx.android.synthetic.main.createdraw.drawingPassword
import kotlinx.android.synthetic.main.popup_create_collaboration_team.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response

class LandingPage : AppCompatActivity() {
    private var texte: TextView? = null
    private var button: Button? = null
    private var clientService = ClientService()
    private var chatSocket: Socket? = null
    private var drawingSocket: Socket?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.content_landing_page)
        //Initialize chat socket
        SocketHandler.setChatSocket()
        SocketHandler.establishChatSocketConnection()
        chatSocket = SocketHandler.getChatSocket()

        chatSocket?.on("usersArrayToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                ClientInfo.usersList= Gson().fromJson(data, UsersArrayList::class.java)
            }
        }

        chatSocket?.on("teamsArrayToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                ClientInfo.teamsList = Gson().fromJson(data, TeamsArrayList::class.java)
            }
        }

        //initialize drawing socket
        //SocketHandler.setDrawingSocket()
        //SocketHandler.establishDrawingSocketConnection()
        //drawingSocket = SocketHandler.getDrawingSocket()

        profileButton.setOnClickListener {
            startActivity(Intent(this, OwnProfile::class.java))
        }

        creerSalon.setOnClickListener{
            startActivity(Intent(this, CreateDraw::class.java))}

        disconnect.setOnClickListener {
            disconnect()
        }

//            if (createDrawing == null) {
//                createDrawing = Dialog(this)
//                createDrawing!!.setContentView(R.layout.createdraw)
//                createDrawing!!.show()
//                button = createDrawing!!.findViewById(R.id.button)
//                button?.setOnClickListener(){
//                    startActivity(Intent(this, Drawing::class.java))
//                    createDrawing!!.hide()
//                    createDrawing = null
//                }
////                texte = createDrawing!!.findViewById(R.id.fermer)
//                texte?.isEnabled = true
//                texte?.setOnClickListener {
//                    createDrawing!!.hide()
//                    createDrawing = null
//                }
//
//        }

    }
    fun disconnect(){
        runBlocking{
            launch{
                clientService.disconnect()
            }

        }
        chatSocket?.disconnect()
        drawingSocket?.disconnect()
        finish()
    }
    override fun onDestroy() {
        disconnect()
        super.onDestroy()
    }
}


internal class CreateCollaborationTeamDialog(context: Context): Dialog(context){
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
            if (newDrawing.visibility == Visibility.protectedVisibility.int) {
                if (teamPassword.text.isBlank() || teamPassword.text.isEmpty()) {
                    canProcessQuery = false
                    errorTeam.text = "Le mot de passe est obligatoire et" +
                        " ne peut pas être composé seulemwnt d'espaces quand le dessin est protégé"
                } else {
                    createTeamDto.password = teamPassword.text.toString()
                }
            } else {
                createTeamDto.password = null
            }

            createTeamDto.nbCollaborators = nbCollaborators.text.toString().toInt()
            createTeamDto.name = teamName.text.toString()
            createTeamDto.ownerId = ClientInfo.userId

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
                    TeamUtils.currentTeam = TeamGeneralInformation()
                    val joinTeam = JoinTeamDto(
                        teamName = createTeamDto.name,
                        userId = createTeamDto.ownerId,
                        password = createTeamDto.password)
                    SocketHandler.getChatSocket().emit("joinTeam", joinTeam.toJson())

                } else {
                    error.text = "Une erreur est arrivée lors de la création du l'équipe." +
                        " Un autre dessin a possiblement le même nom. Veuillez essayer un autre nom."
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
