package com.example.android

import android.annotation.SuppressLint
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.core.widget.doAfterTextChanged
import com.example.android.canvas.ModifyDrawingDto
import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.canvas.Visibility
import com.example.android.chat.*
import com.example.android.client.ClientService
import com.example.android.team.CantJoin
import io.socket.client.Socket
import kotlinx.android.synthetic.main.activity_modify_drawing_params.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response

class ModifyDrawingParams : AppCompatActivity(){

    private var socket: Socket?=null
    private var modifyDrawing = ModifyDrawingDto()
    private var information = ReceiveDrawingInformation()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_modify_drawing_params)

        supportActionBar!!.setDisplayShowHomeEnabled(true)
        supportActionBar!!.setLogo(R.mipmap.ic_launcher_round)
        supportActionBar!!.setDisplayUseLogoEnabled(true)

        socket = SocketHandler.getChatSocket()
        val data = intent.extras!!.getString("drawingInformation")
        information = ReceiveDrawingInformation().fromJson(data!!)

        /*==========Fragments========================================*/
        val manager = supportFragmentManager
        val chatDialog = ChatDialog(this)
        showChatModifyDrawingPage.setOnClickListener {
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
        /*=====================================================*/

        /*=================Buttons interactions and UI=================*/
        modifyDrawingName.doAfterTextChanged {
            if(isNotValid()){
                modifyDrawingParams.isClickable = false
                modifyDrawingParams.isEnabled = false
            }
            else{
                modifyDrawingParams.isClickable = true
                modifyDrawingParams.isEnabled = true
            }
        }

        val options = arrayOf("public", "protegé", "privé")
        spOptionModifyDrawing.adapter = ArrayAdapter<String>(this,
            android.R.layout.simple_list_item_1, options)
        spOptionModifyDrawing.setSelection(information.visibility!!)
        spOptionModifyDrawing.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p0: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
                resultModifyDrawingVisibility.text = options[p2]
                modifyDrawing.newVisibility = p2
                if (p2 == 1) {
                    modifyDrawingPassword.visibility = View.VISIBLE
                } else {
                    modifyDrawingPassword.visibility = View.INVISIBLE
                }
                if(isNotValid()){
                    modifyDrawingParams.isClickable = false
                    modifyDrawingParams.isEnabled = false
                }
                else{
                    modifyDrawingParams.isClickable = true
                    modifyDrawingParams.isEnabled = true
                }
            }

            @SuppressLint("SetTextI18n")
            override fun onNothingSelected(p0: AdapterView<*>?) {
                resultModifyDrawingVisibility.text = options[information.visibility!!]
            }
        }

        modifyDrawingParams.setOnClickListener {
            var canProcessQuery = true
            if (modifyDrawing.newVisibility == Visibility.protectedVisibility.int) {
                if (modifyDrawingPassword.text.isBlank() || modifyDrawingPassword.text.isEmpty()) {
                    canProcessQuery = false
                    Toast.makeText(this, "Le mot de passe est obligatoire et" +
                        " ne peut pas être composé d'espace quand le dessin est protégé",
                        Toast.LENGTH_SHORT).show()
                } else {
                    modifyDrawing.password = modifyDrawingPassword.text.toString()
                }
            }
            else{
                modifyDrawing.password = null
            }
            modifyDrawing.drawingId = information.id
            modifyDrawing.userId = information.ownerId
            if(modifyDrawingName.text.isNotEmpty() && modifyDrawingName.text.isNotBlank()){
                modifyDrawing.newName = modifyDrawingName.text.toString()
            }

            if(canProcessQuery){
                var response: Response<ResponseBody>?= null
                runBlocking {
                    async {
                        launch {
                            response = ClientService().modifyDrawing(modifyDrawing)
                        }
                    }
                }

                if(response!!.isSuccessful){
                    Toast.makeText(this, "Les paramètres du dessin" +
                        " ont été modfiées avec succès", Toast.LENGTH_SHORT).show()
                    finish()
                }
                else{
                    val errorMessage = CantJoin().fromJson(response!!.errorBody()!!.string())
                    Toast.makeText(this, errorMessage.message,
                        Toast.LENGTH_SHORT).show()
                }
            }
        }

        //Toggle the output of the button



        /*=============================================================*/
    }

    fun isNotValid(): Boolean{
        if((modifyDrawingName.text.toString().isEmpty() ||
            modifyDrawingName.text.toString().isBlank()) &&
            (modifyDrawing.newVisibility == information.visibility
                || modifyDrawing.newVisibility == null)
            ){
           return true
        }

        return false
    }

}
