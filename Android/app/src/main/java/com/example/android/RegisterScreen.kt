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
            if(!validateAnyValuesIsEmpty(firstName.text.toString(), lastName.text.toString(),
                pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString())){
                button.isEnabled = true
                button.isClickable = true
            }
        }

        lastName.doAfterTextChanged {
            if(!validateAnyValuesIsEmpty(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString())){
                button.isEnabled = true
                button.isClickable = true
            }
        }

        pseudo.doAfterTextChanged {
            if(!validateAnyValuesIsEmpty(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString())){
                button.isEnabled = true
                button.isClickable = true
            }
        }

        password.doAfterTextChanged {
            if(!validateAnyValuesIsEmpty(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString())){
                button.isEnabled = true
                button.isClickable = true
            }
        }

        confirmPassword.doAfterTextChanged {
            if(!validateAnyValuesIsEmpty(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString())
                && password.text.equals(confirmPassword.text)){
                button.isEnabled = true
                button.isClickable = true
            }
        }


        email.doAfterTextChanged {
            if(!validateAnyValuesIsEmpty(firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString())){
                button.isEnabled = true
                button.isClickable = true
            }
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
            ClientInfo.userInformation.id = response?.body()?.string()
            startActivity(Intent(this, OwnProfile::class.java))
        }

        login.setOnClickListener(){
            startActivity(Intent(this, LoginScreen::class.java))
        }
    }

    private fun validateAnyValuesIsEmpty(firstName : String,
                                         lastName : String,
                                         pseudo : String,
                                         password : String,
                                         confirmPassword : String,
                                         email : String): Boolean{

        return (firstName.isEmpty() ||
            lastName.isEmpty() || pseudo.isEmpty()
            || password.isEmpty() || confirmPassword.isEmpty()
            || email.isEmpty())
    }

}
