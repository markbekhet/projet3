package com.example.android.canvas

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.view.MotionEvent
import android.view.View
import androidx.core.content.res.ResourcesCompat
import com.example.android.R

private const val STROKE_WIDTH = 12f // has to be float

class CanvasView(context: Context): View(context) {
    private lateinit var bitmap: Bitmap
    private lateinit var canvas: Canvas

    private var tool: Tool = FreeHand()
    private val backgroundColor = ResourcesCompat.getColor(resources, R.color.white
        ,null)

    private val drawColor = ResourcesCompat.getColor(resources, R.color.black, null)

    private val paint = Paint().apply {
        color = drawColor
        // Smooths out edges of what is drawn without affecting shape.
        isAntiAlias = true
        // Dithering affects how colors with higher-precision than the device are down-sampled.
        isDither = true
        style = Paint.Style.STROKE // default: FILL
        strokeJoin = Paint.Join.ROUND // default: MITER
        strokeCap = Paint.Cap.ROUND // default: BUTT
        strokeWidth = STROKE_WIDTH // default: Hairline-width (really thin)
    }


    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent?): Boolean {
        when(event?.action){
            MotionEvent.ACTION_DOWN -> tool.touchStart(event!!.x, event!!.y)
            MotionEvent.ACTION_MOVE -> tool.touchMove(canvas, this, context,
                event!!.x, event!!.y, paint)
            MotionEvent.ACTION_UP -> tool.touchUp()
        }
        return true
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        if(::bitmap.isInitialized) bitmap.recycle()
         bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
         canvas = Canvas(bitmap)
         canvas.drawColor(backgroundColor)
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        canvas?.drawColor(backgroundColor)
        canvas?.drawBitmap(bitmap, 0f, 0f, null)
    }

}
