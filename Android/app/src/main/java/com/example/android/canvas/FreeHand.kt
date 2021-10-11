package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.view.View
import android.view.ViewConfiguration

class FreeHand : Tool {

    private var path = Path()

    private var currentX = 0f
    private var currentY = 0f


    override fun touchStart(eventX: Float, eventY: Float) {
        path.reset()
        path.moveTo(eventX, eventY)
        currentX = eventX
        currentY = eventY

    }

    override fun touchMove(canvas: Canvas?, view: View,
                           context: Context, eventX: Float, eventY: Float, paint: Paint
    ) {
        val touchTolerance = ViewConfiguration.get(context).scaledTouchSlop
        val dx = Math.abs(eventX - currentX)
        val dy = Math.abs(eventY - currentY)
        if (dx >= touchTolerance || dy >= touchTolerance) {
            // QuadTo() adds a quadratic bezier from the last point,
            // approaching control point (x1,y1), and ending at (x2,y2).
            path.quadTo(currentX, currentY, (eventX + currentX) / 2,
                (eventY + currentY) / 2)
            currentX = eventX
            currentY = eventY
            // Draw the path in the extra bitmap to cache it.
            canvas?.drawPath(path, paint)
        }
        view.invalidate()
    }

    override fun touchUp() {
        path.reset()
    }

}
