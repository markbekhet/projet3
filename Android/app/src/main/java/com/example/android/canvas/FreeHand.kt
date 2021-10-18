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

class FreeHand(prefix: String, owner: AbstractDocument) : Tool, SVGOMPolylineElement(prefix, owner) {

    override var currentX = 0f
    override var currentY = 0f
    override var selected = false
    override var str = "<polyline "
    override  var startTransformPoint = Point(0f,0f)
    override var totalTranslation = Point(0f,0f)

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
        selectedTools.add(this)
        val halfPointNumber = this.points.points.numberOfItems/2
        val midPoint = this.points.points.getItem(halfPointNumber)
        startTransformPoint = Point(midPoint.x, midPoint.y)
        view.invalidate()
    }

    override fun getString(): String {
        getString(selected)
        return str
    }

    override fun getString(selectionActive: Boolean){
        str = "<polyline "
        val startPoint = this.getAttribute("points")
        val translate = this.getAttribute("transformTranslate")
        str += "points=\"$startPoint\" "
        str += "transform=\"$translate\" "
        str += " stroke=\"#000000\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";
        str += " stroke-linecap=\"round\""
        str += " stroke-linejoin=\"round\""

        if(selectionActive){
            str += " stroke-dasharray=\"4\""
            str += " stroke=\"#0000FF\""
        }
        str += "/>\n"
    }

    override fun containsPoint(eventX: Float, eventY: Float): Boolean{
        val pointsArray = this.points.points
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
        }
        return false
    }

    override fun scale(view: View, scalePoint: Point) {
        TODO("Not yet implemented")
    }
    override fun translate(view:View, translationPoint: Point){
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transformTranslate",
            "translate(${totalTranslation.x}," +
            "${totalTranslation.y})")
        view.invalidate()
    }

    private fun isInIncludeRange(actualPoint: Float, curserPoint: Float):Boolean{
        return curserPoint >= actualPoint - 50 && curserPoint <= actualPoint + 50
    }
}
