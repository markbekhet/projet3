package com.example.android.profile

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.Context
import android.content.DialogInterface
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
import com.example.android.client.ProfileModification
import com.example.android.client.UserProfileInformation
import kotlinx.android.synthetic.main.activity_own_profile.*
import kotlinx.android.synthetic.main.popup_modify_parameters.*
import kotlinx.coroutines.*
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Response


val clientService = ClientService()

fun getProfile():UserProfileInformation{
    var ret = UserProfileInformation()
    var response: Response<ResponseBody>?= null
    runBlocking {
        launch {
            response = clientService.getUserProfileInformation(ClientInfo.userId)
        }
    }
    if(response!!.isSuccessful){
        val data = response?.body()!!.string()
        ret = UserProfileInformation().fromJson(data)
    }

    return ret
}

fun updateUI(email:TextView, lastName: TextView,
             firstName: TextView, nickname: TextView) {

    val userInformation = getProfile()
    email.text = userInformation.emailAddress
    lastName.text = userInformation.lastName
    nickname.text = userInformation.pseudo
    firstName.text = userInformation.firstName
}

class OwnProfile : AppCompatActivity() {

    var modifyParamsDialog : Dialog? =null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_own_profile)

        val email: TextView = findViewById(R.id.emailValue)
        val lastName: TextView = findViewById(R.id.lastNameValue)
        val firstName: TextView = findViewById(R.id.firstNameValue)
        val nickname: TextView = findViewById(R.id.nicknameValue)

        updateUI(email, lastName, firstName, nickname)


        val modifyParams: Button = findViewById(R.id.modifyParams)

        modifyParams.setOnClickListener{
            modifyParamsDialog = ModifyParams(this, email,
                lastName, firstName, nickname)
            modifyParamsDialog!!.create()
            modifyParamsDialog!!.show()
        }

        //Nous allons avoir besoin de mettre a jour les
        //informations de l'utilisateur suite à la fermeture de la modale



        val viewHistory: Button = findViewById(R.id.viewHistory)

        viewHistory.setOnClickListener {
            startActivity(Intent(this,HistoryAndStatistics::class.java))

        }
    }
}

class ModifyParams(context: Context, email: TextView,
                   lastName: TextView, firstName: TextView, nickname: TextView) : Dialog(context){

    private var emailValue = email
    private var lastNameValue = lastName
    private var firstNameValue = firstName
    private var nicknameValue = nickname

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
            var modification = ProfileModification()

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
                    updateUI(this.emailValue, this.lastNameValue,
                        firstNameValue, nicknameValue)
                    dismiss()
                }
                else{
                    println(response!!.errorBody()!!.string())
                    passwordErrors.text = ""
                    if (newPassword.text.isNotEmpty()){
                        passwordErrors.append("Assurez-vous que l'ancien mot de passe" +
                            " est correcte et que votre nouveau mot de passe n'est pas" +
                            " la même que l'ancienne. " )
                    }
                    if(newNickname.text.isNotEmpty()){
                        passwordErrors.append("Un autre utilisateur utilise le même pseudonyme." +
                            " Veuillez saisir un autre pseudonyme.")
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
