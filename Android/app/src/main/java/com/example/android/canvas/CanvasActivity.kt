package com.example.android.canvas

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.android.R

class CanvasActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        //setContentView(R.layout.activity_canvas)
        val canvas = CanvasView(this)
        setContentView(canvas)
    }
}
