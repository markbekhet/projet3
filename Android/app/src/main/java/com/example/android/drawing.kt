package com.example.android

import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.core.graphics.toColor
import com.example.android.canvas.*
import com.google.gson.Gson
import kotlinx.android.synthetic.main.createdraw.*
import kotlinx.android.synthetic.main.dessin.*
import okhttp3.internal.toHexString
import top.defaults.colorpicker.ColorPickerPopup

class drawing : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dessin)
        val selectedColor = "#0000FF"
        val unselectedColor = "#FFFFFF"
        //primaryColor.setBackgroundColor(Color.parseColor("#000000"))
        //secondaryColor.setBackgroundColor(Color.parseColor("#FFFFFF"))

        val params: ViewGroup.LayoutParams = fl_drawing_view_container.getLayoutParams()
        //Button new width
        //Button new width
        SocketHandler.setDrawingSocket()
        DrawingUtils.currentTool = pencilString
        pencil.setBackgroundColor(Color.parseColor(selectedColor))
        SocketHandler.establishDrawingSocketConnection()
        val canvas = CanvasView(this)
        params.width=1200
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
        pencil.setOnClickListener {
            DrawingUtils.currentTool = pencilString
            pencil.setBackgroundColor(Color.parseColor(selectedColor))
            rectangle.setBackgroundColor(Color.parseColor(unselectedColor))
            ellipse.setBackgroundColor(Color.parseColor(unselectedColor))
            selection.setBackgroundColor(Color.parseColor(unselectedColor))
        }

        rectangle.setOnClickListener {
            DrawingUtils.currentTool = rectString
            pencil.setBackgroundColor(Color.parseColor(unselectedColor))
            rectangle.setBackgroundColor(Color.parseColor(selectedColor))
            ellipse.setBackgroundColor(Color.parseColor(unselectedColor))
            selection.setBackgroundColor(Color.parseColor(unselectedColor))
        }

        ellipse.setOnClickListener {
            DrawingUtils.currentTool = ellipseString
            pencil.setBackgroundColor(Color.parseColor(unselectedColor))
            rectangle.setBackgroundColor(Color.parseColor(unselectedColor))
            ellipse.setBackgroundColor(Color.parseColor(selectedColor))
            selection.setBackgroundColor(Color.parseColor(unselectedColor))
        }
        primaryColor.setOnClickListener {
            ColorPickerPopup.Builder(this).initialColor(Color.BLACK)
                .enableBrightness(true)
                .okTitle("Choisir")
                .enableAlpha(false)
                .cancelTitle("Annuler")
                .showIndicator(true)
                .showValue(true)
                .build()
                .show(it, ColorPicker(primaryColor, DrawingUtils.primaryColor))
        }
        secondaryColor.setOnClickListener {
            ColorPickerPopup.Builder(this)
                .enableBrightness(true)
                .okTitle("Choisir")
                .enableAlpha(false)
                .cancelTitle("Annuler")
                .showIndicator(true)
                .showValue(true)
                .build()
                .show(it, ColorPicker(secondaryColor, "secondary"))
        }
    }

    private class ColorPicker(var button: View, var string: String): ColorPickerPopup.ColorPickerObserver() {
        override fun onColorPicked(color: Int){
            button.setBackgroundColor(color)
            if(string == "secondary"){
                DrawingUtils.secondaryColor = "#${color.toHexString().substring(2)}"
            }
            else{
                DrawingUtils.primaryColor = "#${color.toHexString().substring(2)}"
            }

        }
    }
}
