package com.example.android

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.core.widget.doAfterTextChanged
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import com.example.android.client.UserRegistrationInfo
import com.example.android.profile.OwnProfile
import kotlinx.android.synthetic.main.activity_register_screen.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response
import android.text.TextUtils
import android.util.Patterns


class RegisterScreen : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_screen)

        val firstName: EditText = findViewById(R.id.firstName)
        val lastName: EditText = findViewById(R.id.lastName)
        val pseudo: EditText = findViewById(R.id.pseudonyme)
        val password: EditText = findViewById(R.id.password)
        val confirmPassword: EditText = findViewById(R.id.confirm_password)
        val email: EditText = findViewById(R.id.editTextTextEmailAddress)
        val button: Button = findViewById(R.id.button)

        var clientService = ClientService()

        firstName.doAfterTextChanged {
            (validater(firstName.text.toString(), lastName.text.toString(),
                pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()))
        }

        lastName.doAfterTextChanged {
            (validater(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()))
        }

        pseudo.doAfterTextChanged {
            validater(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString())
        }

        password.doAfterTextChanged {
            (validater(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()))
        }

        confirmPassword.doAfterTextChanged {
            (validater(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()))
        }


        email.doAfterTextChanged {
            (validater(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()))
        }


        button.setOnClickListener {
            val user = UserRegistrationInfo(firstName.text.toString(),
                lastName.text.toString(), pseudo.text.toString(),
                email.text.toString(), password.text.toString())

            var response: Response<ResponseBody>? = null

            runBlocking {
                async {
                    launch {
                        response = clientService.createUser(user)
                    }
                }
            }
            ClientInfo.userId = response?.body()?.string().toString()
            startActivity(Intent(this, OwnProfile::class.java))
        }

        login.setOnClickListener(){
            startActivity(Intent(this, LoginScreen::class.java))
        }
    }

    private fun validater(firstName : String,
                                         lastName : String,
                                         pseudo : String,
                                         password : String,
                                         confirmPassword : String,
                                         email : String): Boolean{
        if(((firstName.isNotEmpty() &&
                    lastName.isNotEmpty() && pseudo.isNotEmpty()
                    && password.isNotEmpty() && confirmPassword.isNotEmpty()
                    && email.isNotEmpty()) && isValidEmail(email) && (password == confirmPassword)))
        {button.isEnabled = true
        button.isClickable = true
            return true}

            else{
            button.isEnabled = false
            button.isClickable = false
            return false
        }
    }

    fun isValidEmail(target: CharSequence?): Boolean {
        return if (TextUtils.isEmpty(target)) {
            false
        } else {
            Patterns.EMAIL_ADDRESS.matcher(target).matches()
        }
    }
}
