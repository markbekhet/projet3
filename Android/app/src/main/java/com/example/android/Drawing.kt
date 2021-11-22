package com.example.android

import android.graphics.Canvas
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import com.example.android.canvas.*
import com.example.android.client.ClientInfo
import com.google.gson.Gson
import io.socket.client.Socket
import kotlinx.android.synthetic.main.dessin.*
import top.defaults.colorpicker.ColorPickerPopup
import java.util.*

class Drawing : AppCompatActivity() {
    private var socket = SocketHandler.getChatSocket()
    private var drawingRelatedInformation: ReceiveDrawingInformation?= null
    private var drawingID: Int?= null
    private var canvas: CanvasView? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dessin)
        DrawingUtils.currentTool = pencilString
        val selectedColor = "#0000FF"
        val unselectedColor = "#FFFFFF"
        DrawingUtils.primaryColor = black
        DrawingUtils.secondaryColor = none

        val data = intent.extras!!.getString("drawingInformation")
        drawingID = intent.extras!!.getInt("drawingID")
        val allDrawingInformation = AllDrawingInformation().fromJson(data!!)
        //primaryColor.setBackgroundColor(Color.parseColor("#000000"))
        //secondaryColor.setBackgroundColor(Color.parseColor("#FFFFFF"))
        val params: ViewGroup.LayoutParams = fl_drawing_view_container.getLayoutParams()
        //Button new width
        //Button new width
        drawingRelatedInformation = allDrawingInformation.drawing
        nom.text = drawingRelatedInformation!!.name
        pencil.setBackgroundColor(Color.parseColor(selectedColor))
        canvas = CanvasView(drawingID!!,this)
        canvas!!.parseExistingDrawings(drawingRelatedInformation!!.contents)
        params.width= drawingRelatedInformation!!.width!!
        params.height= drawingRelatedInformation!!.height!!

        fl_drawing_view_container.setLayoutParams(params)
        canvas!!.setBackgroundColor(
            Color.parseColor("#ff${drawingRelatedInformation!!.bgColor}"))
        fl_drawing_view_container.addView(canvas)
        socket.on("drawingToClient"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                val dataTransformed = Gson().fromJson(data, ContentDrawingSocket::class.java)
                canvas!!.onReceivedDrawing(dataTransformed)
            }
        }
        socket.on("drawingContentCreated"){ args ->
            if(args[0] != null){
                val data = args[0] as String
                canvas!!.receiveContentID(data)
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

        selection.setOnClickListener {
            DrawingUtils.currentTool = selectionString
            pencil.setBackgroundColor(Color.parseColor(unselectedColor))
            rectangle.setBackgroundColor(Color.parseColor(unselectedColor))
            ellipse.setBackgroundColor(Color.parseColor(unselectedColor))
            selection.setBackgroundColor(Color.parseColor(selectedColor))
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
                .enableAlpha(true)
                .okTitle("Choisir")
                .cancelTitle("Annuler")
                .showIndicator(true)
                .showValue(true)
                .build()
                .show(it, ColorPicker(primaryColor, DrawingUtils.primaryColor, canvas!!))
        }

        transparent.setOnCheckedChangeListener { buttonView, isChecked ->
            DrawingUtils.secondaryColor = none
            canvas!!.updateToolSecondaryColor()
        }

        secondaryColor.setOnClickListener {
            transparent.isSelected = false
            transparent.isChecked = false
            ColorPickerPopup.Builder(this)
                .enableBrightness(true)
                .okTitle("Choisir")
                .enableAlpha(true)
                .cancelTitle("Annuler")
                .showIndicator(true)
                .showValue(true)
                .build()
                .show(it, ColorPicker(secondaryColor, "secondary", canvas!!))
        }
        thickness.value = DrawingUtils.thickness.toFloat()
        thickness.addOnChangeListener { slider, value, fromUser ->
            DrawingUtils.thickness = value.toInt()
            canvas!!.updateToolThickness()
        }
        delete.setOnClickListener {
            canvas!!.deleteTool()
        }
    }

    override fun onDestroy() {
        if(canvas != null){
            canvas!!.unselectAllChildren()
        }
        leaveDrawing()
        super.onDestroy()
    }

    /*override fun onBackPressed() {
        leaveDrawing()
        super.onBackPressed()

    }*/
    override fun onPause(){
        if(canvas != null){
            canvas!!.unselectAllChildren()
        }
        super.onPause()
    }

    private fun leaveDrawing(){
        val leaveDrawing = LeaveDrawingDto(drawingID!!, ClientInfo.userId)
        socket.emit("leaveDrawing", leaveDrawing.toJson())
        //finish()
    }

    private class ColorPicker(var button: View, var string: String, var canvas: CanvasView):
        ColorPickerPopup.ColorPickerObserver() {
        override fun onColorPicked(color: Int){
            button.setBackgroundColor(color)
            val a = Color.alpha(color)
            val r = Color.red(color)
            val g = Color.green(color)
            val b = Color.blue(color)
            val colorString = String.format(Locale.getDefault(), "%02X%02X%02X%02X",r, g, b, a)
            if(string == "secondary"){
                DrawingUtils.secondaryColor = "#$colorString"
                canvas.updateToolSecondaryColor()
            }
            else{
                DrawingUtils.primaryColor = "#$colorString"
                canvas.updateToolPrimaryColor()
            }

        }
    }
}
