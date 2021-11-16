package com.example.android

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.media.Image
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.core.widget.doAfterTextChanged
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import com.example.android.client.UserRegistrationInfo
import kotlinx.android.synthetic.main.activity_register_screen.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response
import android.text.TextUtils
import android.util.Patterns
import android.widget.ImageView
import kotlinx.android.synthetic.main.avatar.*
import kotlinx.android.synthetic.main.avatar.view.*
import kotlinx.android.synthetic.main.fragment_avatar.*
import kotlinx.android.synthetic.main.fragment_avatar.view.*
import kotlinx.android.synthetic.main.popup_modify_parameters.*


class RegisterScreen : AppCompatActivity() {

    private var imagePicker: ImageView? = null

    private val PERMISSION_CODE:Int =1001;
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_screen)

        val firstName: EditText = findViewById(R.id.longueur)
        val lastName: EditText = findViewById(R.id.largeur)
        val pseudo: EditText = findViewById(R.id.pseudonyme)
        val password: EditText = findViewById(R.id.password)
        val confirmPassword: EditText = findViewById(R.id.confirm_password)
        val email: EditText = findViewById(R.id.editTextTextEmailAddress)
        val button: Button = findViewById<Button>(R.id.button)
        val  IMAGE_PICK_CODE: Int =1000;
        val pickImage = 100
        //val camera: Button = findViewById<Button>(fragmentAvatar.camera.id)
        val gallery: Button = findViewById<Button>(R.id.avatar2)
        val image : ImageView? = findViewById<ImageView>(img_save.id)
        var clientService = ClientService()

        //handle result of picked image

        fun onActivityResult(requestCode: Intent, resultCode: Int) {
            if (resultCode == Activity.RESULT_OK && resultCode == IMAGE_PICK_CODE){
                image!!.setImageURI(requestCode?.data)
            }

        }

        fun pickImageFromGallery() {
            //Intent to pick image
            val intent = Intent(Intent.ACTION_PICK)
            intent.type = "image/*"
            onActivityResult(intent, IMAGE_PICK_CODE)

        }
        gallery.setOnClickListener() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
                if (checkSelfPermission(android.Manifest.permission.READ_EXTERNAL_STORAGE) ==
                    PackageManager.PERMISSION_DENIED){
                    //permission denied
                    val permissions = arrayOf(android.Manifest.permission.READ_EXTERNAL_STORAGE);
                    //show popup to request runtime permission
                    requestPermissions(permissions, PERMISSION_CODE);
                }
                else{
                    //permission already granted
                    pickImageFromGallery();
                }
            }
            else{
                //system OS is < Marshmallow
                pickImageFromGallery();
            }


        }


            firstName.doAfterTextChanged {
                (validater(
                    firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()
                ))
            }

            lastName.doAfterTextChanged {
                (validater(
                    firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()
                ))
            }

            pseudo.doAfterTextChanged {
                validater(
                    firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()
                )
                errorPassword.text = ""
            }

            password.doAfterTextChanged {
                (validater(
                    firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()
                ))
                errorPassword.text = ""
            }

            confirmPassword.doAfterTextChanged {
                (validater(
                    firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()
                ))
                errorPassword.text = ""
            }


            email.doAfterTextChanged {
                (validater(
                    firstName.text.toString(), lastName.text.toString(),
                    pseudo.text.toString(), password.text.toString(),
                    confirmPassword.text.toString(), email.text.toString()
                ))
                errorPassword.text = ""
            }


            button.setOnClickListener {
                val user = UserRegistrationInfo(
                    firstName.text.toString(),
                    lastName.text.toString(), pseudo.text.toString(),
                    email.text.toString(), password.text.toString()
                )

                var response: Response<ResponseBody>? = null
                var canProcessQuery = true

                if (password.text.length < 8) {
                    errorPassword.append("Le mot de passe doit avoir au moins 8 caractères")
                    canProcessQuery = false
                }
                val regex = Regex(
                    """((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$"""
                )
                if (!regex.matches(password.text.toString())) {
                    errorPassword.append(
                        "Le mot de passe ne doit pas avoir d'espace " +
                                "et doit contenir au moins: " +
                                "* Un caractèere en majuscule " +
                                "* Un caractère en miniscule " +
                                "* Un caractère spécial " +
                                "* Un chiffre"
                    )
                    canProcessQuery = false
                }

                if (canProcessQuery) {

                    runBlocking {
                        async {
                            launch {
                                response = clientService.createUser(user)
                            }
                        }
                    }
                    if (response?.isSuccessful == true) {
                        ClientInfo.userId = response?.body()?.string().toString()
                        startActivity(Intent(this, LandingPage::class.java))
                    } else {
                        errorPassword.text = "Il semble qu'un autre utilisateur a le même" +
                                " adresse courriel ou le même pseudonyme."
                    }
                }
            }

            login.setOnClickListener() {
                startActivity(Intent(this, LoginScreen::class.java))
            }
        }

        private fun validater(
            firstName: String,
            lastName: String,
            pseudo: String,
            password: String,
            confirmPassword: String,
            email: String
        ): Boolean {
            if (((firstName.isNotEmpty() &&
                        lastName.isNotEmpty() && pseudo.isNotEmpty()
                        && password.isNotEmpty() && confirmPassword.isNotEmpty()
                        && email.isNotEmpty()) && isValidEmail(email) && (password == confirmPassword))
            ) {
                button.isEnabled = true
                button.isClickable = true
                return true
            } else {
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

