package com.example.android

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.ViewGroup
import com.example.android.canvas.*
import com.google.gson.Gson
import kotlinx.android.synthetic.main.createdraw.*
import kotlinx.android.synthetic.main.dessin.*

class drawing : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dessin)

        val params: ViewGroup.LayoutParams = fl_drawing_view_container.getLayoutParams()
        //Button new width
        //Button new width
        SocketHandler.setDrawingSocket()
        DrawingUtils.currentTool = pencilString
        SocketHandler.establishDrawingSocketConnection()
        val canvas = CanvasView(this)
        params.width=1500
        params.height= 800
//        params.width = longueur.text.toString().toInt()
//        params.height =largeur.text.toString().toInt()
        fl_drawing_view_container.setLayoutParams(params)
        fl_drawing_view_container.addView(canvas)
        val socket = SocketHandler.getDrawingSocket()

        socket.on("drawingToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val dataTransformed = Gson().fromJson(data, ContentDrawingSocket::class.java)
                canvas.onReceivedDrawing(dataTransformed)
            }
        }
        selection.setOnClickListener {
            DrawingUtils.currentTool = pencilString
        }

        rectangle.setOnClickListener {
            DrawingUtils.currentTool = rectString
        }

        ellipse.setOnClickListener {
            DrawingUtils.currentTool = ellipseString
        }
    }
}
