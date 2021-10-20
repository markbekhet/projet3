package com.example.android

import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import com.google.android.material.snackbar.Snackbar
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import com.example.android.profile.OwnProfile
import com.example.android.profile.createdraw
import kotlinx.android.synthetic.main.content_landing_page.*
import kotlinx.android.synthetic.main.createdraw.*

class LandingPage : AppCompatActivity() {
    private var texte: TextView? = null
    private var button: Button? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.content_landing_page)


        creerSalon.setOnClickListener(){
            startActivity(Intent(this, createdraw::class.java))}
//            if (createDrawing == null) {
//                createDrawing = Dialog(this)
//                createDrawing!!.setContentView(R.layout.createdraw)
//                createDrawing!!.show()
//                button = createDrawing!!.findViewById(R.id.button)
//                button?.setOnClickListener(){
//                    startActivity(Intent(this, drawing::class.java))
//                    createDrawing!!.hide()
//                    createDrawing = null
//                }
////                texte = createDrawing!!.findViewById(R.id.fermer)
//                texte?.isEnabled = true
//                texte?.setOnClickListener {
//                    createDrawing!!.hide()
//                    createDrawing = null
//                }
//
//        }

    }
}