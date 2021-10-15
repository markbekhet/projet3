package com.example.android.canvas

import android.content.Context
import android.view.View
import org.apache.batik.anim.dom.SVGOMEllipseElement
import org.apache.batik.anim.dom.SVGOMPolylineElement
import org.apache.batik.anim.dom.SVGOMRectElement
import org.apache.batik.anim.dom.SVGOMSVGElement
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Document
import org.w3c.dom.svg.SVGElement
import kotlin.math.abs

class Ellipse(prefix: String, owner: AbstractDocument):
    SVGOMEllipseElement(prefix, owner), Tool {
    override var currentX = 0f
    override var currentY = 0f
    override var str = "<ellipse "
    override lateinit var node: SVGElement
    private var startingPositionX = 0f
    private var startingPositionY = 0f

    override fun touchStart(doc: Document,
                            eventX: Float,
                            eventY: Float) {
        node = doc.createElementNS(svgNS,"ellipse") as SVGOMEllipseElement
        startingPositionX = eventX
        startingPositionY = eventY

    }

    override fun touchMove(view: View, context: Context, eventX: Float, eventY: Float) {
        val rx = abs(eventX - startingPositionX)/2
        val ry = abs(eventY - startingPositionY)/2
        node.setAttribute("rx", rx.toString())
        node.setAttribute("ry", ry.toString())
        node.setAttribute("cx",(startingPositionX+rx).toString())
        node.setAttribute("cy",(startingPositionY+ry).toString())
        currentY = eventY
        currentX = eventX
        view.invalidate()
    }

    override fun touchUp() {
        if(startingPositionY > currentY){
            val cy = currentY + node.getAttribute("cy").toFloat()
            node.setAttribute("cy", cy.toString())
        }
        if(startingPositionX > currentX){
            val cx = currentX + node.getAttribute("cx").toFloat()
            node.setAttribute("cx", cx.toString())
        }
    }

    override fun getString(): String {
        str = "<ellipse "
        val rx = node.getAttribute("rx")
        val ry = node.getAttribute("ry")
        var cx = 0f
        if(startingPositionX > currentX){
            cx = currentX + rx.toFloat()
        }
        else{
            cx = startingPositionX + rx.toFloat()
        }
        str += "cx=\"$cx\" "

        var cy = 0f
        if(startingPositionY > currentY){
            cy = currentY + ry.toFloat()
        }
        else{
            cy = startingPositionY + ry.toFloat()
        }
        str += "cy=\"$cy\" "

        rx?.let{
            str += "rx=\"$it\" "
        }
        ry?.let{
            str += "ry=\"$it\" "
        }
        str += " stroke=\"#000000\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";
        str += "/>\n"
        return str
    }


}
