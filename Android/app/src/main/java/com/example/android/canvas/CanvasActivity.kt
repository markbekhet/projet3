package com.example.android.canvas

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.android.R
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.svg.SVGElement

class CanvasActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        //setContentView(R.layout.activity_canvas)
        val canvas = CanvasView(this)
        setContentView(canvas)
    }
}
