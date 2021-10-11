package com.example.android.profile

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import com.example.android.R
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import kotlinx.android.synthetic.main.activity_own_profile.*
import kotlinx.android.synthetic.main.popup_modify_parameters.*
import kotlinx.coroutines.*
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Response

class OwnProfile : AppCompatActivity() {

    var modifyParamsDialog : Dialog? =null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_own_profile)

        val email: TextView = findViewById(R.id.emailValue)
        val lastName: TextView = findViewById(R.id.lastNameValue)
        val firstName: TextView = findViewById(R.id.firstNameValue)
        val nickname: TextView = findViewById(R.id.nicknameValue)

        val clientService = ClientService()


        fun updateUI() {
            runBlocking {
                async {
                    launch {
                        clientService.getUserProfileInformation()
                    }
                }
            }

           val userInformation = ClientInfo.userInformation
            email.text = userInformation.emailAddress
            lastName.text = userInformation.lastName
            nickname.text = userInformation.pseudo
            firstName.text = userInformation.firstName
        }

        updateUI()


        val modifyParams: Button = findViewById(R.id.modifyParams)

        modifyParams.setOnClickListener{
            modifyParamsDialog = ModifyParams(this)
            modifyParamsDialog!!.create()
            modifyParamsDialog!!.show()
        }

        //Nous allons avoir besoin de mettre a jour les
        //informations de l'utilisateur suite à la fermeture de la modale

        modifyParamsDialog?.setOnDismissListener {
            updateUI()
        }


        val viewHistory: Button = findViewById(R.id.viewHistory)

        viewHistory.setOnClickListener {
            startActivity(Intent(this,HistoryAndStatistics::class.java))

        }
    }
}

class ModifyParams(context: Context) : Dialog(context){
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

        var clientService = ClientService()

        newPassword.doAfterTextChanged {
            passwordErrors.text = ""

            if(newPassword.text.isNotEmpty() &&
                confirmNewPassword.text.isNotEmpty() &&
                oldPassword.text.isNotEmpty()){
                okButton.isClickable = true;
                okButton.isEnabled = true;
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
                okButton.isClickable = false;
                okButton.isEnabled = false;
            }
        }

        confirmNewPassword.doAfterTextChanged {
            passwordErrors.text = ""

            if(newPassword.text.isNotEmpty() &&
                confirmNewPassword.text.isNotEmpty() &&
                oldPassword.text.isNotEmpty()){
                okButton.isClickable = true;
                okButton.isEnabled = true;
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
                okButton.isClickable = false;
                okButton.isEnabled = false;
            }
        }

        oldPassword.doAfterTextChanged {
            passwordErrors.text = ""

            if(newPassword.text.isNotEmpty() &&
                confirmNewPassword.text.isNotEmpty() &&
                oldPassword.text.isNotEmpty()){
                okButton.isClickable = true;
                okButton.isEnabled = true;
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
                okButton.isClickable = false;
                okButton.isEnabled = false;
            }
        }

        newNickname.doAfterTextChanged {
            if(newNickname.text.isNotEmpty()){
                okButton.isClickable = true;
                okButton.isEnabled = true;
                passwordErrors.text = ""
            }

            if(newPassword.text.isEmpty() &&
                confirmNewPassword.text.isEmpty() &&
                oldPassword.text.isEmpty() && newNickname.text.isEmpty()){
                passwordErrors.text = ""
                okButton.isClickable = false;
                okButton.isEnabled = false;
            }
        }


        okButton.setOnClickListener {
            //The request to update the information will be sent before hiding the pop up
            var canProcessQuery = true
            var jsonObject = JSONObject()
            if(newNickname.text.isNotEmpty()){
                jsonObject.put("newPseudo", newNickname.text.toString())
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
                    jsonObject.put("newPassword", newPassword.text.toString())
                    jsonObject.put("oldPassword", oldPassword.text.toString())
                }
            }
            if(canProcessQuery){
                var response: Response<ResponseBody>? = null
                runBlocking {
                    withContext(Dispatchers.IO){
                        launch{
                            try{
                                response = clientService.modifyProfile(jsonObject)
                            } catch(e: Exception){
                                println(e.message)
                            }
                        }
                    }
                }
            }
        }

        cancelButton.setOnClickListener {
            super.dismiss()
        }

        setCanceledOnTouchOutside(true)
    }

    fun isPasswordEqual(newPass: String, confirmPass: String): Boolean {
        return newPass == confirmPass

    }
}
