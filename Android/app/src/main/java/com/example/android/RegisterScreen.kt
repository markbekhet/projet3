package com.example.android

import android.app.Activity
import android.app.Dialog
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.media.Image
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.provider.MediaStore
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
import com.example.android.profile.GalleryAvatar
import kotlinx.android.synthetic.main.avatar.*
import kotlinx.android.synthetic.main.avatar.view.*
import kotlinx.android.synthetic.main.fragment_avatar.*
import kotlinx.android.synthetic.main.fragment_avatar.view.*
import com.example.android.team.CantJoin
import kotlinx.android.synthetic.main.popup_modify_parameters.*
import androidx.activity.result.ActivityResultLauncher

import android.R.attr.data
import android.annotation.SuppressLint
import androidx.activity.result.contract.ActivityResultContracts
import com.bumptech.glide.Glide
import com.example.android.client.avatarClientInfo
import android.graphics.BitmapFactory

import android.R.attr.data
import android.content.res.Resources
import android.util.Base64
import com.example.android.profile.Gallery
import java.io.ByteArrayOutputStream
import android.R.attr.data
import android.graphics.Color
import android.os.SystemClock.sleep
import nl.dionsegijn.konfetti.models.Shape
import nl.dionsegijn.konfetti.models.Size
import okhttp3.internal.wait


class RegisterScreen : AppCompatActivity() {


    @SuppressLint("ResourceType")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register_screen)

        val firstName: EditText = findViewById(R.id.longueur)
        val lastName: EditText = findViewById(R.id.largeur)
        val pseudo: EditText = findViewById(R.id.pseudonyme)
        val password: EditText = findViewById(R.id.password)
        var texte: Button? = null
        val confirmPassword: EditText = findViewById(R.id.confirm_password)
        val email: EditText = findViewById(R.id.editTextTextEmailAddress)
        val button: Button = findViewById<Button>(R.id.button)
        var galerie: Dialog? = null
        var clientService = ClientService()
        val REQUEST_IMAGE_CAPTURE = 1
        val r: Resources = this.resources

//        var resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
//            if (result.resultCode == Activity.RESULT_OK ) {
//                // There are no request codes
//                val data: Intent? = result.data
//                val imageBitmap = data!!.extras!!.get("data") as Bitmap
//                img_save.setImageBitmap(imageBitmap)
//            }
//        }
fun CreateImageStringFromBitmap(): String {

    val bitmap:Bitmap = BitmapFactory.decodeResource(resources, avatarClientInfo!!.avatarClient!!)

    val resized = Bitmap.createScaledBitmap(
        bitmap, (300).toInt(),
        (300).toInt(), true
    )
    //CONVERT IN image
//    val decodedString: ByteArray = Base64.decode(encodedImage, Base64.DEFAULT)
//    val decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
    val stream = ByteArrayOutputStream()
    resized.compress(Bitmap.CompressFormat.PNG, 75, stream)
    val byteArray: ByteArray = stream.toByteArray()

    return Base64.encodeToString(byteArray, Base64.DEFAULT)
}



        val encodedImage :String= CreateImageStringFromBitmap()
        val decodedString = Base64.decode(encodedImage, Base64.DEFAULT)
        val decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.size)
        Glide.with(this).load(decodedByte).fitCenter().into(img_save);

            println(avatarClientInfo.avatarClient)
//            img_save.apply {if(avatarClientInfo.avatarSelection) {
//                Glide.with(this)
//                    .load(avatarClientInfo.avatarClient)
//                    .into(img_save)
//            }}
//                img_save.setImageResource(avatarClientInfo.avatarClient!!)


//        avatarClientInfo!!.avatarClient?.let { img_save.setImageResource(it) }
        fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == RESULT_OK) {
                val imageBitmap = data!!.extras!!.get("data") as Bitmap
                img_save.setImageBitmap(imageBitmap)
            }
        }
        //handle result of picked image
        fun pickImageFromGallery(){
            startActivity(Intent(this, Gallery::class.java))
//            if (galerie == null) {
//                galerie = Dialog(this)
//                galerie!!.setContentView(R.layout.galleryavatar)
//                galerie!!.show()
//                texte = gallery!!.findViewById(R.id.fermer) as Button?
//                texte?.isEnabled = true
//                texte?.setOnClickListener {
//                    galerie!!.hide()
//                    galerie = null
//                }
//            }
        }
        //proceso de transformar la imagen BitMap en un String:
//android:src="c:\logo.png"
        //proceso de transformar la imagen BitMap en un String:



        gallery.setOnClickListener() {

                pickImageFromGallery();

        }
        camera.setOnClickListener() {

            val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            try {
                startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE)
                finish()
            } catch (e: ActivityNotFoundException) {
                // display error state to the user
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
                    email.text.toString(), password.text.toString(),avatar = encodedImage)

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
                        runBlocking {
                            async {
                                launch {
                                    viewKonfetti.build()
                                        .addColors(Color.YELLOW, Color.GREEN, Color.MAGENTA)
                                        .setDirection(0.0, 359.0)
                                        .setSpeed(1f, 5f)
                                        .setFadeOutEnabled(true)
                                        .setTimeToLive(2000L)
                                        .addShapes(Shape.RECT, Shape.CIRCLE)
                                        .addSizes(Size(12, 5F)).setPosition(
                                            -50f,
                                            viewKonfetti.getWidth() + 50f,
                                            -50f,
                                            -50f
                                        )
                                        .streamFor(300, 5000L)

                                    viewKonfetti2.build()
                                        .addColors(Color.YELLOW, Color.GREEN, Color.MAGENTA)
                                        .setDirection(0.0, 359.0)
                                        .setSpeed(1f, 5f)
                                        .setFadeOutEnabled(true)
                                        .setTimeToLive(2000L)
                                        .addShapes(Shape.RECT, Shape.CIRCLE)
                                        .addSizes(Size(12, 5F)).setPosition(
                                            500F,
                                            viewKonfetti.getWidth() + 500F,
                                            -50f,
                                            -50f
                                        )
                                        .streamFor(300, 5000L)

                                    viewKonfetti3.build()
                                        .addColors(Color.YELLOW, Color.GREEN, Color.MAGENTA)
                                        .setDirection(0.0, 359.0)
                                        .setSpeed(1f, 5f)
                                        .setFadeOutEnabled(true)
                                        .setTimeToLive(2000L)
                                        .addShapes(Shape.RECT, Shape.CIRCLE)
                                        .addSizes(Size(12, 5F)).setPosition(
                                            1000f,
                                            viewKonfetti.getWidth() + 1000f,
                                            -50f,
                                            -50f
                                        )
                                        .streamFor(300, 5000L)

                                    viewKonfetti4.build()
                                        .addColors(Color.YELLOW, Color.GREEN, Color.MAGENTA)
                                        .setDirection(0.0, 359.0)
                                        .setSpeed(1f, 5f)
                                        .setFadeOutEnabled(true)
                                        .setTimeToLive(2000L)
                                        .addShapes(Shape.RECT, Shape.CIRCLE)
                                        .addSizes(Size(12, 5F)).setPosition(
                                            1500f,
                                            viewKonfetti.getWidth() + 1500f,
                                            -50f,
                                            -50f
                                        )
                                        .streamFor(300, 5000L)

                                }
                            }
                        }



                        startActivity(Intent(this, LandingPage::class.java))
                        finish()
                    } else {
                        val errorMessage = CantJoin().fromJson(response!!.errorBody()!!.string())
                        errorPassword.text = errorMessage.message
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

