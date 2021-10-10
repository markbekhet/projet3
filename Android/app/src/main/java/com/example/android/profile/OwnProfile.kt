package com.example.android.profile

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
import kotlinx.android.synthetic.main.popup_modify_parameters.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

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

        modifyParamsDialog?.setOnDismissListener {
            updateUI()
        }

        //Nous allons avoir besoin d<update les informations de l'utilisateur
        // suite à la fermeture de la modale

        val viewHistory: Button = findViewById(R.id.viewHistory)

        viewHistory.setOnClickListener {
            startActivity(Intent(this,HistoryAndStatistics::class.java))

        }
    }
}

class ModifyParams(context: Context) : Dialog(context){
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.popup_modify_parameters)
        val okButton:Button = findViewById(R.id.confirm)
        val cancelButton: Button = findViewById(R.id.cancel)
        val newPassword: EditText = findViewById(R.id.newPassword)
        val confirmNewPassword: EditText = findViewById(R.id.confirmNewPassword)
        val newNickname: EditText = findViewById(R.id.newNickname)

        newPassword.doAfterTextChanged {
            if(confirmNewPassword.text.isEmpty()){

            }else if(oldPassword.text.isEmpty()){

            }
        }

        okButton.setOnClickListener {
            //The request to update the information will be sent before hiding the pop up
            super.dismiss()
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
