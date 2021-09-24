package com.example.android

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import kotlinx.android.synthetic.main.activity_login_screen.*
import android.app.Dialog
import android.widget.Button

class LoginScreen : AppCompatActivity() {
    private var ErrorLogIn: Dialog? = null
    private var texte : Button? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login_screen)

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
                button.setOnClickListener() {

                    if (username.text.toString()
                            .isNotEmpty() && username.text.toString() != "Nom d'utilisateur"
                    ) {
                        println(username.text.toString())
                        startActivity(Intent(this, MainActivity::class.java))
                        print(username.toString())
                    } else {
                        showError()
                    }
                }

        }
    }
