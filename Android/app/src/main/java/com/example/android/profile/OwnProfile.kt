package com.example.android.profile

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Intent
import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Base64
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import com.bumptech.glide.Glide
import com.example.android.R
import com.example.android.SocketHandler
import com.example.android.chat.ChatDialog
import com.example.android.chat.ChatRooms
import com.example.android.chat.ClientMessage
import com.example.android.client.*
import kotlinx.android.synthetic.main.activity_own_profile.*
import kotlinx.android.synthetic.main.avatar.*
import kotlinx.android.synthetic.main.popup_modify_parameters.*
import kotlinx.coroutines.*
import okhttp3.ResponseBody
import retrofit2.Response

class OwnProfile : AppCompatActivity() {

    var modifyParamsDialog : Dialog? =null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_own_profile)
        val data = intent.extras?.getString("profileInformation")

        val chatDialog= ChatDialog(this)
        showChatOwnerProfile.setOnClickListener {
            chatDialog.show(supportFragmentManager, ChatDialog.TAG)
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

        val dataForm = UserProfileInformation().fromJson(data)
        updateUI(dataForm)


        val modifyParams: Button = findViewById(R.id.modifyParams)

        modifyParams.setOnClickListener{
            modifyParamsDialog = ModifyParams(this)
            modifyParamsDialog!!.create()
            modifyParamsDialog!!.show()
            modifyParamsDialog!!.setOnDismissListener {
                val joinRequest = UserProfileRequest(ClientInfo.userId, ClientInfo.userId)
                SocketHandler.getChatSocket().emit("getUserProfileRequest", joinRequest.toJson())
                var i = 0
                SocketHandler.getChatSocket().on("profileToClient"){ args ->
                    if(args[0]!=null && i==0){
                        val dataAfterUpdate = args[0] as String
                        val userInformation = UserProfileInformation().fromJson(dataAfterUpdate)
                        updateUI(userInformation)
                        i++
                    }
                }
            }

        }
        gallery.setOnClickListener {
            val gallery = GalleryAvatar(this, true)
            gallery.show()
            gallery.setOnDismissListener {
                val joinRequest = UserProfileRequest(ClientInfo.userId, ClientInfo.userId)
                SocketHandler.getChatSocket().emit("getUserProfileRequest", joinRequest.toJson())
                var i = 0
                SocketHandler.getChatSocket().on("profileToClient"){ args ->
                    if(args[0]!=null && i==0){
                        val dataAfterUpdate = args[0] as String
                        val userInformation = UserProfileInformation().fromJson(dataAfterUpdate)
                        updateUI(userInformation)
                        i++
                    }
                }
            }
        }

        camera.setOnClickListener {
            val bundle = Bundle()
            bundle.putString("request", "true")
            val intent = Intent(this, CameraActivity::class.java)
            intent.putExtras(bundle)
            startActivity(intent)
        }

        val viewHistory: Button = findViewById(R.id.viewHistory)

        viewHistory.setOnClickListener {
            val bundle = Bundle()
            bundle.putString("profileInformation", data)
            startActivity(Intent(this,HistoryAndStatistics::class.java)
                .putExtras(bundle))

        }
    }
    fun updateUI(userInformation: UserProfileInformation) {

        //getProfile()
        runOnUiThread {
            emailValue.text = userInformation.emailAddress
            lastNameValue.text = userInformation.lastName
            nicknameValue.text = userInformation.pseudo
            firstNameValue.text = userInformation.firstName
            val decodedString: ByteArray = Base64.decode(userInformation.avatar, Base64.DEFAULT)
            val decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
            Glide.with(this).load(decodedByte).fitCenter().into(img_save)
        }
        //avatarClientInfo.avatarClient = userInformation!!.avatar!!.toInt()
    }

    override fun onRestart(){
        val joinRequest = UserProfileRequest(ClientInfo.userId, ClientInfo.userId)
        SocketHandler.getChatSocket().emit("getUserProfileRequest", joinRequest.toJson())
        var i = 0
        SocketHandler.getChatSocket().on("profileToClient"){ args ->
            if(args[0]!=null && i==0){
                val data = args[0] as String
                val userInformation = UserProfileInformation().fromJson(data)
                updateUI(userInformation)
                i++
            }
        }
        super.onRestart()
    }
}

class ModifyParams(var context: OwnProfile) : Dialog(context){


    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.popup_modify_parameters)
        val okButton:Button = findViewById(R.id.confirm)
        val cancelButton: Button = findViewById(R.id.cancel)
        val newPassword: EditText = findViewById(R.id.newPassword)
        val confirmNewPassword: EditText = findViewById(R.id.confirmNewPassword)
        val newNickname: EditText = findViewById(R.id.newNickname)
        val passwordErrors: TextView = findViewById(R.id.passwordErrors)
        val clientService = ClientService()


        newPassword.doAfterTextChanged {
            passwordErrors.text = ""

            if(newPassword.text.isNotEmpty() &&
                confirmNewPassword.text.isNotEmpty() &&
                oldPassword.text.isNotEmpty()){
                okButton.isClickable = true
                okButton.isEnabled = true
                passwordErrors.text = ""
            }
            if(confirmNewPassword.text.isEmpty()) {
                passwordErrors.append("Veuillez confirmer la nouvelle mot de passe. ")
            }
            if(oldPassword.text.isEmpty()){
                passwordErrors.append("Veuillez entrer votre ancienne mot de passe")
            }

            if(newPassword.text.isEmpty() &&
                confirmNewPassword.text.isEmpty() &&
                oldPassword.text.isEmpty() && newNickname.text.isEmpty()){
                passwordErrors.text = ""
                okButton.isClickable = false
                okButton.isEnabled = false
            }
        }

        confirmNewPassword.doAfterTextChanged {
            passwordErrors.text = ""

            if(newPassword.text.isNotEmpty() &&
                confirmNewPassword.text.isNotEmpty() &&
                oldPassword.text.isNotEmpty()){
                okButton.isClickable = true
                okButton.isEnabled = true
                passwordErrors.text = ""
            }
            if(newPassword.text.isEmpty()) {
                passwordErrors.append("Veuillez entrer un nouveaux mot de passe. ")
            }
            if(oldPassword.text.isEmpty()){
                passwordErrors.append("Veuillez entrer votre ancienne mot de passe.")
            }
            if(newPassword.text.isEmpty() &&
                confirmNewPassword.text.isEmpty() &&
                oldPassword.text.isEmpty() && newNickname.text.isEmpty()){
                passwordErrors.text = ""
                okButton.isClickable = false
                okButton.isEnabled = false
            }
        }

        oldPassword.doAfterTextChanged {
            passwordErrors.text = ""

            if(newPassword.text.isNotEmpty() &&
                confirmNewPassword.text.isNotEmpty() &&
                oldPassword.text.isNotEmpty()){
                okButton.isClickable = true
                okButton.isEnabled = true
                passwordErrors.text = ""
            }
            if(newPassword.text.isEmpty()) {
                passwordErrors.append("Veuillez entrer un nouveaux mot de passe. ")
            }
            if(confirmNewPassword.text.isEmpty()){
                passwordErrors.append("Veuillez confirmer votre nouveau mot de passe.")

            }
            if(newPassword.text.isEmpty() &&
                confirmNewPassword.text.isEmpty() &&
                oldPassword.text.isEmpty() && newNickname.text.isEmpty()){
                passwordErrors.text = ""
                okButton.isClickable = false
                okButton.isEnabled = false
            }
        }

        newNickname.doAfterTextChanged {
            if(newNickname.text.isNotEmpty()){
                okButton.isClickable = true
                okButton.isEnabled = true
                passwordErrors.text = ""
            }

            if(newPassword.text.isEmpty() &&
                confirmNewPassword.text.isEmpty() &&
                oldPassword.text.isEmpty() && newNickname.text.isEmpty()){
                passwordErrors.text = ""
                okButton.isClickable = false
                okButton.isEnabled = false
            }
        }


        okButton.setOnClickListener {
            //The request to update the information will be sent before hiding the pop up
            var canProcessQuery = true
            val modification = ProfileModification()

            if(newNickname.text.isNotEmpty()){
                modification.newPseudo = newNickname.text.toString()
            }
            if(newPassword.text.isNotEmpty()){
                passwordErrors.text = ""
                if(newPassword.text.toString() != confirmNewPassword.text.toString()){
                    passwordErrors.append("La confirmation du mot de passe est différente du " +
                        "nouveau mot de passe. ")
                    canProcessQuery = false
                }
                if(newPassword.text.length < 8){
                    passwordErrors.append("Le mot de passe doit avoir au moins 8 caractères")
                    canProcessQuery = false
                }
                val regex = Regex(
                    """((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$""")
                if(!regex.matches(newPassword.text.toString())){
                    passwordErrors.append("Le mot de passe ne doit pas avoir d'espace " +
                        "et doit contenir au moins: " +
                        "* Un caractèere en majuscule " +
                        "* Un caractère en miniscule " +
                        "* Un caractère spécial " +
                        "* Un chiffre")
                    canProcessQuery = false
                }
                if(canProcessQuery){
                    modification.newPassword = newPassword.text.toString()
                    modification.oldPassword = oldPassword.text.toString()
                }
            }
            if(canProcessQuery){
                var response: Response<ResponseBody>? = null
                runBlocking {
                    launch{
                        response = clientService.modifyProfile(modification)
                        println(response)
                    }
                }
                if(response!!.isSuccessful){
                    dismiss()
                }
                else{
                    println(response!!.errorBody()!!.string())
                    passwordErrors.text = ""
                    passwordErrors.append(response!!.errorBody()!!.string())
                }
            }
        }

        cancelButton.setOnClickListener {
            super.dismiss()
        }

        setCanceledOnTouchOutside(true)
    }
}
