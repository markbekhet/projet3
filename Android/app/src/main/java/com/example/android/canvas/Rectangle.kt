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
    override var totalScaling = Point(0f,0f)
    override var scalingPositions = HashMap<Point, Point>()
    private var selectionOffset = 20f
    //var abstractTool = AbstractTool(this)

    override fun touchStart(view: View, eventX: Float,
                            eventY: Float) {
        this.setAttribute("x", eventX.toString())
        this.setAttribute("y", eventY.toString())
        this.setAttribute("width", "0")
        this.setAttribute("height", "0")
        this.setAttribute("transformTranslate", "")
        this.setAttribute("transformScale","")
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

        if(!selectedTools.contains(this)){
            selectedTools.add(this)
        }

        val xCert = this.getAttribute("x").toFloat()
        val yCert = this.getAttribute("y").toFloat()
        val widthCert = this.getAttribute("width").toFloat()
        val heightCert = this.getAttribute("height").toFloat()
        startTransformPoint.x = xCert + (widthCert/2)
        startTransformPoint.y = yCert + (heightCert/2)
        view.invalidate()
    }

    override fun getString(): String {
        str = ""
        getOriginalString()
        if(selected){
            getSelectionString()
        }

        return str
    }

    override fun getOriginalString() {
        str += "<rect "
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

        str += "/>\n"
    }

    override fun containsPoint(eventX: Float, eventY: Float): Boolean{
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()

        val isInXAxes = eventX <= x + width + (2*selectionOffset) + totalTranslation.x
            && eventX >= x - selectionOffset + totalTranslation.x
        val isInYAxes = eventY <= y + height + (2*selectionOffset)+ totalTranslation.y
            && eventY >= y - selectionOffset + totalTranslation.y
        return isInXAxes && isInYAxes
    }

    override fun scale(view: View, scalePoint: Point) {
    }

    override fun translate(view: View, translationPoint: Point) {
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transformTranslate",
            "translate(${totalTranslation.x}," +
                "${totalTranslation.y})")

        view.invalidate()
    }

    override fun getSelectionString() {
        str += "<rect "
        val x = this.getAttribute("x")
        val y = this.getAttribute("y")
        val width = this.getAttribute("width")
        val height = this.getAttribute("height")
        val transform = this.getAttribute("transformTranslate")

        x?.let{
            if(it.toFloat() > currentX){
                str += "x=\"${currentX - selectionOffset}\" "
            }
            else{
                str += "x=\"${it.toFloat() - selectionOffset}\" "
            }

        }
        y?.let{
            if(it.toFloat() > currentY){
                str += "y=\"${currentY - selectionOffset}\" "
            }
            else{
                str += "y=\"${it.toFloat() - selectionOffset}\" "
            }
        }
        width?.let{
            str += "width=\"${it.toFloat() + (2*selectionOffset)}\" "
        }
        height?.let{
            str += "height=\"${it.toFloat() + (2*selectionOffset)}\" "
        }
        transform?.let{
            str += "transform=\"$it\""
        }

        str += " stroke=\"#0000FF\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";
        str += " stroke-dasharray=\"4\""
        str += "/>\n"
    }

    override fun calculateScalingPositions() {
        scalingPositions.clear()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val firstPos = Point(x, y)
        val firstDirection = Point(-1f, -1f)
        scalingPositions[firstPos] = firstDirection

        val secondPos = Point(x + (width/2), y)
        scalingPositions[secondPos] = Point(0f,-1f)

        val thirdPos = Point(x + width, y)
        scalingPositions[thirdPos] = Point(1f, -1f)

        val forthPos = Point(x + width, y + (height/2))
        scalingPositions[forthPos] = Point(1f, 0f)

        val fifthPos = Point(x + width, y + height)
        scalingPositions[fifthPos] = Point(1f, 1f)

        val sixthPos = Point(x + (width/2), y + height)
        scalingPositions[sixthPos] = Point(0f, 1f)

        val seventhPos = Point(x, y + height)
        scalingPositions[seventhPos] = Point(-1f, 1f)

        val eighthPos = Point(x , y + (height/2))
        scalingPositions[eighthPos] = Point(-1f, 0f)
    }
}
