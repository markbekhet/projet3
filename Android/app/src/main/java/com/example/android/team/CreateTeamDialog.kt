package com.example.android.team

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.doAfterTextChanged
import com.example.android.LandingPage
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.canvas.Visibility
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import kotlinx.android.synthetic.main.popup_create_collaboration_team.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response

internal class CreateCollaborationTeamDialog(var content: AppCompatActivity): Dialog(content){
    private var createTeamDto = CreateTeamDto()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.popup_create_collaboration_team)
        val option: Spinner = findViewById(R.id.spOptionTeam)
        val clientService = ClientService()

        val options = arrayOf("publique", "protegée")
        option.adapter = ArrayAdapter<String>(context, android.R.layout.simple_list_item_1, options)
        option.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p0: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
                createTeamDto.visibility = p2
                if (p2 == 1) {
                    teamPassword.visibility = View.VISIBLE
                } else {
                    teamPassword.visibility = View.INVISIBLE
                }
            }

            @SuppressLint("SetTextI18n")
            override fun onNothingSelected(p0: AdapterView<*>?) {
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
            if(bioFieldEntry.text.isNotEmpty() && bioFieldEntry.text.isNotBlank()){
                createTeamDto.bio = bioFieldEntry.text.toString()
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
                            val bundle = Bundle()
                            bundle.putString("teamInformation", extraData)
                            bundle.putString("teamGeneralInformation", teamGeneralInformation.toJson())
                            content.startActivity(Intent(content,
                                TeamActivity::class.java).putExtras(bundle))
                            i++
                            dismiss()
                        }
                    }

                } else {
                    val errorMessage = CantJoin().fromJson(response!!.errorBody()!!.string())
                    content.runOnUiThread{
                        Toast.makeText(context, errorMessage.message,
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
