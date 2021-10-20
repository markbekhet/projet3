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
import java.lang.Float.min
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
    private var selectionOffset = 0f
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
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()

        this.setAttribute("y", min(currentY,y).toString())

        this.setAttribute("x", min(currentX,x).toString())
        view.invalidate()
    }

    override fun touchUp(view: View, selectedTools: ArrayList<Tool>) {
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
            getScalingPositionsString()
        }

        return str
    }

    override fun getOriginalString() {
        str += "<rect "
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width")
        val height = this.getAttribute("height")
        val transform = this.getAttribute("transformTranslate")

        str += "x=\"${x}\" "

        str += "y=\"${y}\" "
        str += "width=\"$width\" "
        str += "height=\"$height\" "
        str += "transform=\"$transform\""


        str += " stroke=\"#000000\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";

        str += "/>\n"
    }

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean{
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

    override fun scale(view: View, scalePoint: Point , direction: Point) {
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()
        val minPoint = Point(x , y)
        val maxPoint = Point(x + width, y + height)
        if(direction.x == -1f){
            println(minPoint.x)
            minPoint.x += scalePoint.x
            println(minPoint.x)
            currentX = minPoint.x
        }
        else if(direction.x == 1f){
            maxPoint.x += scalePoint.x
        }
        if(direction.y == -1f){
            minPoint.y += scalePoint.y
            currentY = minPoint.y
        }
        else if(direction.y == 1f){
            maxPoint.y += scalePoint.y
        }

        this.setAttribute("y", min(minPoint.y,maxPoint.y).toString())
        this.setAttribute("x", min(minPoint.x,maxPoint.x).toString())
        this.setAttribute("width", abs(maxPoint.x - minPoint.x).toString())
        this.setAttribute("height", abs(maxPoint.y - minPoint.y).toString())
        view.invalidate()
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
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()
        val transform = this.getAttribute("transformTranslate")

        str += "x=\"${x}\" "
        str += "y=\"${y}\" "
        str += "width=\"${width}\" "

        str += "height=\"${height}\" "
        str += "transform=\"${transform}\""

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
        val x = min(this.getAttribute("x").toFloat(), currentX)
        val y = min(this.getAttribute("y").toFloat(), currentY)
        val firstPos = Point(x + totalTranslation.x, y + totalTranslation.y)
        val firstDirection = Point(-1f, -1f)
        scalingPositions[firstPos] = firstDirection

        val secondPos = Point(x + (width/2) + totalTranslation.x, y + + totalTranslation.y)
        scalingPositions[secondPos] = Point(0f,-1f)

        val thirdPos = Point(x + width + totalTranslation.x, y + totalTranslation.y)
        scalingPositions[thirdPos] = Point(1f, -1f)

        val forthPos = Point(x + width + totalTranslation.x,
            y + (height/2) + totalTranslation.y)
        scalingPositions[forthPos] = Point(1f, 0f)

        val fifthPos = Point(x + width + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[fifthPos] = Point(1f, 1f)

        val sixthPos = Point(x + (width/2) + totalTranslation.x
            , y + height + totalTranslation.y)
        scalingPositions[sixthPos] = Point(0f, 1f)

        val seventhPos = Point(x + totalTranslation.x
            , y + height + totalTranslation.y)
        scalingPositions[seventhPos] = Point(-1f, 1f)

        val eighthPos = Point(x + totalTranslation.x ,
            y + (height/2) + totalTranslation.y)
        scalingPositions[eighthPos] = Point(-1f, 0f)
    }

    override fun getScalingPoint(point: Point): MutableMap.MutableEntry<Point, Point>?{
        for(item in scalingPositions){
            val position = item.key
            val x = position.x - radius
            val y = position.y - radius
            val width = (position.x + radius) - x
            val height = (position.y + radius) - y
            val inXAxes = point.x >= x && point.x <= x+ width
            val inYAxes = point.y >= y && point.y <= y + height
            if(inXAxes && inYAxes){
                return item
            }
        }
        return null
    }

    override fun getScalingPositionsString(){
        calculateScalingPositions()
        for(item in scalingPositions){
            val position = item.key
            val x = position.x - radius
            val y = position.y - radius
            val width = (position.x + radius) - x
            val height = (position.y + radius) - y
            str += "<rect x=\"$x\" y=\"$y\" width=\"$width\"" +
                " height=\"$height\" stroke=\"#CBCB28\" fill=\"#CBCB28\"/>\n"
        }
    }
}
