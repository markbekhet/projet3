package com.example.android.canvas

import android.content.Context
import android.view.View
import org.apache.batik.anim.dom.SVGOMMPathElement
import org.apache.batik.anim.dom.SVGOMPathElement
import org.apache.batik.anim.dom.SVGOMPolylineElement
import org.apache.batik.dom.AbstractDocument
import org.apache.batik.dom.svg.SVGOMPoint
import org.apache.batik.dom.svg.SVGPathSegItem
import org.w3c.dom.*
import org.w3c.dom.svg.SVGElement
import org.w3c.dom.svg.SVGPathElement
import org.w3c.dom.svg.SVGPathSegList
import java.lang.Float.min
import kotlin.math.abs
import kotlin.math.max

class FreeHand(prefix: String, owner: AbstractDocument) : Tool, SVGOMPolylineElement(prefix, owner) {

    override var currentX = 0f
    override var currentY = 0f
    override var selected = false
    override var str = "<polyline "
    override  var startTransformPoint = Point(0f,0f)
    override var totalTranslation = Point(0f,0f)
    private var minPoint = Point(Float.MAX_VALUE,Float.MAX_VALUE)
    private var maxPoint = Point(0f, 0f)
    override var totalScaling = Point(0f, 0f)
    override var scalingPositions = HashMap<Point, Point>()

    override fun touchStart(view: View, eventX: Float, eventY:Float){
        this.setAttribute("points", "$eventX $eventY")
        this.setAttribute("transformTranslate", "")
        view.invalidate()
    }

    override fun touchMove(view: View,
                           context: Context,
                           eventX: Float,
                           eventY: Float)
    {
        val existingPoints = this.getAttribute("points")
        this.setAttribute("points", "$existingPoints, $eventX $eventY")
        view.invalidate()
    }

    override fun touchUp(view: View, selectedTools: ArrayList<Tool>) {
        selected = true
        if(!selectedTools.contains(this)){
            selectedTools.add(this)
        }
        calculateDelimeterPoints()
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

    override fun getOriginalString(){
        str += "<polyline "
        val startPoint = this.getAttribute("points")
        val translate = this.getAttribute("transformTranslate")
        str += "points=\"$startPoint\" "
        str += "transform=\"$translate\" "
        str += " stroke=\"#000000\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";
        str += " stroke-linecap=\"round\""
        str += " stroke-linejoin=\"round\""
        str += "/>\n"
    }

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean{
        val inXAxes = (eventX >= minPoint.x + totalTranslation.x)
            && (eventX <= maxPoint.x + totalTranslation.x)
        val inYaxes = (eventY >= minPoint.y + totalTranslation.y)
            && (eventY <= maxPoint.y + totalTranslation.y)
        return inXAxes && inYaxes
    }

    override fun scale(view: View, scalePoint: Point , direction: Point) {
        // Needs implementing
        val oldWidth = maxPoint.x - minPoint.x
        val oldHeight = maxPoint.y - minPoint.y
        if(direction.x == -1f){
            minPoint.x += scalePoint.x
            //currentX = minPoint.x
        }
        else if(direction.x == 1f){
            maxPoint.x += scalePoint.x
        }
        if(direction.y == -1f){
            minPoint.y += scalePoint.y
            //currentY = minPoint.y
        }
        else if(direction.y == 1f){
            maxPoint.y += scalePoint.y
        }

        if(minPoint.x >= maxPoint.x){
            direction.x *= -1
        }

        if(minPoint.y >= maxPoint.y){
            direction.y *= -1
        }

        val newWidth = maxPoint.x - minPoint.x
        val newHeight = maxPoint.y - minPoint.y
        val ratioWidth = newWidth / oldWidth
        val ratioHeight = newHeight / oldHeight

        val polylinePoints = this.points.points
        if(polylinePoints.numberOfItems > 0){
            var i = 0
            while(i < polylinePoints.numberOfItems){
                val item = polylinePoints.getItem(i)
                item.x *= ratioWidth
                item.y *= ratioHeight
                i++
            }
        }
        calculateDelimeterPoints()
        view.invalidate()
    }

    override fun translate(view:View, translationPoint: Point){
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transformTranslate",
            "translate(${totalTranslation.x}," +
            "${totalTranslation.y})")
        view.invalidate()
    }

    override fun getSelectionString() {
        str += "<rect "
        val x = minPoint.x
        val y = minPoint.y
        val width = maxPoint.x - minPoint.x
        val height = maxPoint.y - minPoint.y
        str += "x=\"$x\" "
        str += "y=\"$y\" "
        str += "width=\"$width\""
        str += "height=\"$height\""
        val transform = this.getAttribute("transformTranslate")
        transform?.let{
            str += "transform=\"$it\""
        }
        str += " stroke=\"#0000FF\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";
        str += " stroke-dasharray=\"4\""
        str += "/>\n"
    }

    private fun calculateDelimeterPoints(){
        minPoint = Point(Float.MAX_VALUE,Float.MAX_VALUE)
        maxPoint = Point(0f, 0f)
        val polylinePoints = this.points.points
        if(polylinePoints.numberOfItems > 0){
            var i = 0
            while(i < polylinePoints.numberOfItems){
                val item = polylinePoints.getItem(i)
                minPoint.x = min(item.x, minPoint.x)
                minPoint.y = min(item.y, minPoint.y)
                maxPoint.x = max(item.x, maxPoint.x)
                maxPoint.y = max(item.y, maxPoint.y)
                i++
            }
            startTransformPoint =
                Point(
                    polylinePoints.getItem(polylinePoints.numberOfItems/2).x
                    ,polylinePoints.getItem(polylinePoints.numberOfItems/2).y)
        }
    }

    override fun calculateScalingPositions() {
        scalingPositions.clear()
        val width = maxPoint.x - minPoint.x
        val height = maxPoint.y - minPoint.y
        val x = minPoint.x
        val y = minPoint.y

        val firstPos = Point(x + totalTranslation.x,
            y + totalTranslation.y)
        val firstDirection = Point(-1f, -1f)
        scalingPositions[firstPos] = firstDirection

        val secondPos = Point(x + (width/2) + totalTranslation.x
            , y + totalTranslation.y)
        scalingPositions[secondPos] = Point(0f,-1f)

        val thirdPos = Point(x + width + totalTranslation.x,
            y + totalTranslation.y)
        scalingPositions[thirdPos] = Point(1f, -1f)

        val forthPos = Point(x + width + totalTranslation.x,
            y + (height/2) + totalTranslation.y)
        scalingPositions[forthPos] = Point(1f, 0f)

        val fifthPos = Point(x + width + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[fifthPos] = Point(1f, 1f)

        val sixthPos = Point(x + (width/2) + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[sixthPos] = Point(0f, 1f)

        val seventhPos = Point(x + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[seventhPos] = Point(-1f, 1f)

        val eighthPos = Point(x + totalTranslation.x,
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
