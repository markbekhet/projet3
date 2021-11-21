package com.example.android

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_login_screen.*
import android.app.Dialog
import android.view.KeyEvent
import android.widget.Button
import android.widget.TextView
import androidx.core.widget.doAfterTextChanged
import com.example.android.chat.Chat
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import com.example.android.client.Gallery
import com.example.android.client.LoginInfo
import com.example.android.profile.OwnProfile
import kotlinx.android.synthetic.main.message.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response

class LoginScreen : AppCompatActivity() {
    private var ErrorLogIn: Dialog? = null
    private var clientService: ClientService? = null
    private var texte: Button? = null
    var userdata : LoginInfo ?= null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login_screen)
        clientService = ClientService()

        register.setOnClickListener(){
            startActivity(Intent(this, RegisterScreen::class.java))
        }
        fun showError() {
            if (ErrorLogIn == null) {
                ErrorLogIn = Dialog(this)
                ErrorLogIn!!.setContentView(R.layout.popuploginerror)
                ErrorLogIn!!.show()
                texte = ErrorLogIn!!.findViewById(R.id.popup) as Button?
                texte?.isEnabled = true
                texte?.setOnClickListener {
                    ErrorLogIn!!.hide()
                    ErrorLogIn = null
                }
            }
        }

        username.doAfterTextChanged {
            if(username.text.isNotEmpty() && password.text.isNotEmpty()){
                button.isClickable = true
                button.isEnabled = true
            }
            else{
                button.isClickable = false
                button.isEnabled = false
            }
        }

        username.setOnEditorActionListener ( TextView.OnEditorActionListener{
                textView, i, keyEvent ->
            if(keyEvent != null && keyEvent.keyCode.equals(KeyEvent.KEYCODE_ENTER)
                && button.isEnabled){
                button.performClick()
            }
            return@OnEditorActionListener false
        })

        password.doAfterTextChanged {
            if(username.text.isNotEmpty() && password.text.isNotEmpty()){
                button.isClickable = true
                button.isEnabled = true
            }
            else{
                button.isClickable = false
                button.isEnabled = false
            }
        }

        var response: Response<ResponseBody> ?= null
        button.setOnClickListener() {
            runBlocking {
                async{
                    launch {
                        userdata = LoginInfo(username!!.text.toString(),password!!.text.toString())
                        response = clientService!!.login(userdata!!)
                    }
                }
            }

            if (response!!.isSuccessful) {
                println(clientService!!.authentify)
                ClientInfo.userId = response?.body()?.string().toString()
                println("Client id: ${ClientInfo.userId}")
                startActivity(Intent(this, LandingPage::class.java))
                print(username.toString())

            } else {
                showError()
            }
            password.text.clear()
            username.text.clear()
        }
    }
    fun verifyAuth(integer : Int): Boolean {
        if (integer >= 400)
            return true
        return false
    }
}


