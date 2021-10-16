package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.view.View
import android.view.ViewConfiguration
import com.caverock.androidsvg.SVG
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
    override var str = "<polyline "

    override fun touchStart(eventX: Float, eventY:Float){
        this.setAttribute("points", "$eventX $eventY")
        this.setAttribute("fill", "red")
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

    override fun touchUp() {
    }

    override fun getString(): String {
        str = "<polyline "
        if (this.getAttribute("points") != null){
            val startPoint = this.getAttribute("points")
            str += "points=\"$startPoint "
            str += "\""
            str += " stroke=\"#000000\""
            str += " stroke-width=\"3\""
            str += " fill=\"none\"";
            str += " stroke-linecap=\"round\""
            str += " stroke-linejoin=\"round\""
            str += "/>\n"
            return str
        }
        else{
            return ""
        }

    }


}
