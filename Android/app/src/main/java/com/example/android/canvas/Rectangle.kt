package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.view.View
import org.apache.batik.anim.dom.SVGOMRectElement
import org.apache.batik.dom.AbstractDocument
import org.apache.batik.dom.svg.SVGOMMatrix
import org.apache.batik.dom.svg.SVGOMTransform
import org.w3c.dom.Document
import org.w3c.dom.svg.SVGElement
import kotlin.math.abs

class Rectangle(prefix: String, owner: AbstractDocument):
    SVGOMRectElement(prefix, owner), Tool {
    override var currentX = 0f
    override var currentY = 0f
    override var selected = false
    override var str = "<rect "
    override var startTransformPoint = Point(0f, 0f)
    override var totalTranslation = Point(0f,0f)
    //var abstractTool = AbstractTool(this)

    override fun touchStart(view: View, eventX: Float,
                            eventY: Float) {
        this.setAttribute("x", eventX.toString())
        this.setAttribute("y", eventY.toString())
        this.setAttribute("width", "0")
        this.setAttribute("height", "0")
        this.setAttribute("transform", "")
        view.invalidate()
    }

    override fun touchMove(view: View, context: Context, eventX: Float, eventY: Float) {
        val width = abs(eventX - this.getAttribute("x").toFloat())
        val height = abs(eventY - this.getAttribute("y").toFloat())
        this.setAttribute("width", width.toString())
        this.setAttribute("height", height.toString())
        currentY = eventY
        currentX = eventX
        view.invalidate()
    }

    override fun touchUp(view: View, selectedTools: ArrayList<Tool>) {
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        if(y > currentY){
            this.setAttribute("y", currentY.toString())
        }
        if(x > currentX){
            this.setAttribute("x", currentX.toString())
        }
        selected = true
        selectedTools.add(this)
        val xCert = this.getAttribute("x").toFloat()
        val yCert = this.getAttribute("y").toFloat()
        val widthCert = this.getAttribute("width").toFloat()
        val heightCert = this.getAttribute("height").toFloat()
        startTransformPoint.x = xCert + (widthCert/2)
        startTransformPoint.y = yCert + (heightCert/2)
        view.invalidate()
    }

    override fun getString(): String {
        getString(selected)
        return str
    }

    override fun getString(selectionActive: Boolean) {
        str = "<rect "
        val x = this.getAttribute("x")
        val y = this.getAttribute("y")
        val width = this.getAttribute("width")
        val height = this.getAttribute("height")
        val transform = this.getAttribute("transformTranslate")

        x?.let{
            if(it.toFloat() > currentX){
                str += "x=\"$currentX\" "
            }
            else{
                str += "x=\"$it\" "
            }

        }
        y?.let{
            if(it.toFloat() > currentY){
                str += "y=\"$currentY\" "
            }
            else{
                str += "y=\"$it\" "
            }
        }
        width?.let{
            str += "width=\"$it\" "
        }
        height?.let{
            str += "height=\"$it\" "
        }
        transform?.let{
            str += "transform=\"$it\""
        }

        str += " stroke=\"#000000\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";

        if(selectionActive){
            str += " stroke-dasharray=\"4\""
            str += " stroke=\"#0000FF\""
        }

        str += "/>\n"
    }

    override fun containsPoint(eventX: Float, eventY: Float): Boolean{
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()

        val isInXAxes = eventX <= x + width + totalTranslation.x
            && eventX >= x + totalTranslation.x
        val isInYAxes = eventY <= y + height + totalTranslation.y
            && eventY >= y + totalTranslation.y
        return isInXAxes && isInYAxes
    }

    override fun translate(view: View, translationPoint: Point) {
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transformTranslate",
            "translate(${totalTranslation.x}," +
                "${totalTranslation.y})")

        view.invalidate()

    }
}
