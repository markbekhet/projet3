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
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.*
import org.w3c.dom.svg.SVGElement
import org.w3c.dom.svg.SVGPathElement
import org.w3c.dom.svg.SVGPathSegList

class FreeHand(prefix: String, owner: AbstractDocument) : Tool, SVGOMPathElement(prefix, owner) {

    override var currentX = 0f
    override var currentY = 0f
    override var str = "<polyline "
    override lateinit var node: SVGElement

    override fun touchStart(doc: Document, eventX: Float, eventY:Float){
        node = doc.createElementNS(svgNS,"path") as SVGOMPathElement
        node.setAttribute("points", "$eventX $eventY")
        node.setAttribute("fill", "red")
        //node.setAttribute("L", "")
    }

    override fun touchMove(view: View,
                           context: Context, eventX: Float, eventY: Float, paint: Paint
    ) {
        val existingPoints = node.getAttribute("points")
        node.setAttribute("points", "$existingPoints, $eventX $eventY")
        view.invalidate()
    }

    override fun touchUp() {
    }

    override fun getString(): String {
        str = "<polyline "
        if (node.getAttribute("points") != null){
            val startPoint = node.getAttribute("points")
            str += "points=\"$startPoint "
            /*val progressPoints = node.getAttribute("L")
            progressPoints?.let{
                str += it
            }*/
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
