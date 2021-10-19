package com.example.android

import android.app.Dialog
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import com.google.android.material.snackbar.Snackbar
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.navigateUp
import androidx.navigation.ui.setupActionBarWithNavController
import kotlinx.android.synthetic.main.content_landing_page.*

class LandingPage : AppCompatActivity() {
    private var createDrawing: Dialog? = null
    private var texte: TextView? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.content_landing_page)


        creerSalon.setOnClickListener(){
            if (createDrawing == null) {
                createDrawing = Dialog(this)
                createDrawing!!.setContentView(R.layout.createdraw)
                createDrawing!!.show()
                texte = createDrawing!!.findViewById(R.id.fermer)
                texte?.isEnabled = true
                texte?.setOnClickListener {
                    createDrawing!!.hide()
                    createDrawing = null
                }
        }

    }
}}