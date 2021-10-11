package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.view.View

interface Tool {
    fun touchStart(eventX: Float, eventY: Float)
    fun touchMove(canvas: Canvas?, view: View, context: Context,
                  eventX: Float, eventY: Float, paint: Paint)
    fun touchUp()
}
