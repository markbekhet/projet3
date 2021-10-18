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

        val halfPointNumber = this.points.points.numberOfItems/2
        val midPoint = this.points.points.getItem(halfPointNumber)
        startTransformPoint = Point(midPoint.x, midPoint.y)
        calculateDelimeterPoints()
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

    override fun containsPoint(eventX: Float, eventY: Float): Boolean{
        /*val pointsArray = this.points.points
        var i = 0
        if(pointsArray.numberOfItems > 0) {
            while(i < pointsArray.numberOfItems){
                val point = pointsArray.getItem(i)
                val isInY = isInIncludeRange(
                    point.y + totalTranslation.y, eventY)
                val isInX = isInIncludeRange(
                    point.x + totalTranslation.x, eventX)

                if(isInX && isInY){
                    return true
                }
                i++
            }
        }*/
        val inXAxes = (eventX >= minPoint.x) && (eventX <= maxPoint.x)
        val inYaxes = (eventY >= minPoint.y) && (eventY <= maxPoint.y)
        return inXAxes && inYaxes
    }

    override fun scale(view: View, scalePoint: Point) {
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

    private fun isInIncludeRange(actualPoint: Float, curserPoint: Float):Boolean{
        return curserPoint >= actualPoint - 50 && curserPoint <= actualPoint + 50
    }

    private fun calculateDelimeterPoints(){
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
        }
    }

    override fun calculateScalingPositions() {
        scalingPositions.clear()
        val width = maxPoint.x - minPoint.x
        val height = maxPoint.y - minPoint.y
        val x = minPoint.x
        val y = minPoint.y

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
