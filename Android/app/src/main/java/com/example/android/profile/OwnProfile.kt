package com.example.android.profile

import android.app.Dialog
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import com.example.android.R
import com.example.android.client.ClientService
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class OwnProfile : AppCompatActivity() {

    var modifyParamsDialog : Dialog? =null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_own_profile)

        var response: Any? = null
        val clientService = ClientService()
        runBlocking {
            async {
                launch {
                    clientService.getUserProfileInformation()
                }
            }
        }

        val modifyParams: Button = findViewById(R.id.modifyParams)

        modifyParams.setOnClickListener{
            modifyParamsDialog = ModifyParams(this)
            modifyParamsDialog!!.create()
            modifyParamsDialog!!.show()
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
        var okButton:Button = findViewById(R.id.confirm)
        okButton.setOnClickListener {
            //The request to update the information will be sent before hiding the pop up
            super.dismiss()
        }
        val cancelButton: Button = findViewById(R.id.cancel)
        cancelButton.setOnClickListener {
            super.dismiss()
        }

        setCanceledOnTouchOutside(true)
    }
}
