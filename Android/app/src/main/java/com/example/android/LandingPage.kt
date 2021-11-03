package com.example.android

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.content_landing_page.*

class LandingPage : AppCompatActivity() {
    private var texte: TextView? = null
    private var button: Button? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.content_landing_page)


        creerSalon.setOnClickListener(){
            startActivity(Intent(this, CreateDraw::class.java))}
//            if (createDrawing == null) {
//                createDrawing = Dialog(this)
//                createDrawing!!.setContentView(R.layout.createdraw)
//                createDrawing!!.show()
//                button = createDrawing!!.findViewById(R.id.button)
//                button?.setOnClickListener(){
//                    startActivity(Intent(this, Drawing::class.java))
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
