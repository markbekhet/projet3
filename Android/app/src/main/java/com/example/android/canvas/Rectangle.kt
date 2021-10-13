package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.view.View

class Rectangle: Tool {

    override var currentX = 0f
    override var currentY = 0f
    private var rect = Rect()

    override fun touchStart(eventX: Float, eventY: Float) {
        rect = Rect()
        rect.top = eventY.toInt()
        rect.left = eventX.toInt()
        currentX = eventX
        currentY = eventY
    }

    override fun touchMove(
        canvas: Canvas?,
        view: View,
        context: Context,
        eventX: Float,
        eventY: Float,
        paint: Paint
    ) {
        rect.setEmpty()
        canvas?.drawRect(rect, paint)
        view.invalidate()
        rect.set(currentX.toInt() , currentY.toInt(), eventX.toInt(), eventY.toInt())
        canvas?.drawRect(rect, paint)
        view.invalidate()
    }

    override fun touchUp() {
        rect.setEmpty()
    }


}
