package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.view.View
import org.apache.batik.anim.dom.SVGOMRectElement
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Document
import org.w3c.dom.svg.SVGElement
import kotlin.math.abs

class Rectangle(prefix: String, owner: AbstractDocument):
    SVGOMRectElement(prefix, owner), Tool {
    override var currentX = 0f
    override var currentY = 0f
    override var str = "<rect "
    override lateinit var node: SVGElement


    override fun touchStart(doc: Document,
                            eventX: Float,
                            eventY: Float) {
        node = doc.createElementNS(svgNS,"rect") as SVGOMRectElement
        node.setAttribute("x", eventX.toString())
        node.setAttribute("y", eventY.toString())
        node.setAttribute("width", "0")
        node.setAttribute("height", "0")

    }

    override fun touchMove(view: View, context: Context, eventX: Float, eventY: Float) {
        val width = abs(eventX - node.getAttribute("x").toFloat())
        val height = abs(eventY - node.getAttribute("y").toFloat())
        node.setAttribute("width", width.toString())
        node.setAttribute("height", height.toString())
        currentY = eventY
        currentX = eventX
        view.invalidate()
    }

    override fun touchUp() {
        var x = node.getAttribute("x").toFloat()
        var y = node.getAttribute("y").toFloat()
        if(y > currentY){
            node.setAttribute("y", currentY.toString())
        }
        if(x > currentX){
            node.setAttribute("x", currentX.toString())
        }
    }

    override fun getString(): String {
        str = "<rect "
        val x = node.getAttribute("x")
        val y = node.getAttribute("y")
        val width = node.getAttribute("width")
        val height = node.getAttribute("height")
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
        str += " stroke=\"#000000\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";
        str += "/>\n"
        return str
    }


}
