package com.example.android

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_login_screen.*
import android.app.Dialog
import android.graphics.Color.alpha
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.KeyEvent
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.ActionBar
import androidx.core.graphics.rotationMatrix
import androidx.core.widget.doAfterTextChanged
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import com.example.android.client.LoginInfo
import com.example.android.team.CantJoin
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
    var userdata: LoginInfo? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login_screen)
        clientService = ClientService()
        val audioManager = getSystemService(AUDIO_SERVICE) as AudioManager
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, 20, 0)
        val mediaPlayer = MediaPlayer.create(this, R.raw.login)
        supportActionBar!!.setDisplayShowHomeEnabled(true)
        supportActionBar!!.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM)
        supportActionBar!!.setDisplayShowCustomEnabled(true)
        supportActionBar!!.setCustomView(R.layout.action_bar_non_message_pages)
        mediaPlayer.start()
        register.setOnClickListener() {
            startActivity(Intent(this, RegisterScreen::class.java))
        }
        fun showError(message: String) {
            if (ErrorLogIn == null) {
                ErrorLogIn = Dialog(this)
                ErrorLogIn!!.setContentView(R.layout.popuploginerror)
                ErrorLogIn!!.show()
                texte = ErrorLogIn!!.findViewById(R.id.popup) as Button?
                texte?.isEnabled = true
                val errorMessage: TextView = ErrorLogIn!!.findViewById(R.id.errorLogin)
                errorMessage.text = message
                texte?.setOnClickListener {
                    ErrorLogIn!!.hide()
                    ErrorLogIn = null
                }
            }
        }
        nom_app.animate().apply() {
            duration = 10000
            rotationYBy(360f)
        }.withEndAction {
            nom_app.animate().apply() {
                duration = 10000
                rotationYBy(360f)
            }
        }.start()

        username.doAfterTextChanged {
            if (username.text.isNotEmpty() && password.text.isNotEmpty()) {
                button.isClickable = true
                button.isEnabled = true
            } else {
                button.isClickable = false
                button.isEnabled = false
            }
        }

        username.setOnEditorActionListener(TextView.OnEditorActionListener { textView, i, keyEvent ->
            if (keyEvent != null && keyEvent.keyCode.equals(KeyEvent.KEYCODE_ENTER)
                && button.isEnabled
            ) {
                button.performClick()
            }
            return@OnEditorActionListener false
        })

        password.doAfterTextChanged {
            if (username.text.isNotEmpty() && password.text.isNotEmpty()) {
                button.isClickable = true
                button.isEnabled = true
            } else {
                button.isClickable = false
                button.isEnabled = false
            }
        }

        var response: Response<ResponseBody>? = null
        button.setOnClickListener() {
            runBlocking {
                async {
                    launch {
                        userdata = LoginInfo(username!!.text.toString(), password!!.text.toString())
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

            }else{
                val cantJoin = CantJoin().fromJson(response!!.errorBody()!!.string())
                showError(cantJoin.message)
            }

            password.text.clear()
            username.text.clear()
        }
    }
}


