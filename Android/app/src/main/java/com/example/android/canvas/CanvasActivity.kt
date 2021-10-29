package com.example.android.canvas

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.android.R
import com.example.android.SocketHandler
import com.google.gson.Gson
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.json.JSONObject
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.svg.SVGElement

class CanvasActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        //setContentView(R.layout.activity_canvas)
        SocketHandler.setDrawingSocket()
        SocketHandler.establishDrawingSocketConnection()
        val canvas = CanvasView(this)
        setContentView(canvas)
        val socket = SocketHandler.getDrawingSocket()

        socket.on("drawingToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val dataTransformed = Gson().fromJson(data, ContentDrawingSocket::class.java)
                canvas.onReceivedDrawing(dataTransformed)
            }
        }
    }
}
