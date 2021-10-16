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
    private var startingPositionX = 0f
    private var startingPositionY = 0f

    override fun touchStart(eventX: Float, eventY: Float) {
        startingPositionX = eventX
        startingPositionY = eventY

    }

    override fun touchMove(view: View, context: Context, eventX: Float, eventY: Float) {
        val rx = abs(eventX - startingPositionX)/2
        val ry = abs(eventY - startingPositionY)/2
        this.setAttribute("rx", rx.toString())
        this.setAttribute("ry", ry.toString())
        this.setAttribute("cx",(startingPositionX+rx).toString())
        this.setAttribute("cy",(startingPositionY+ry).toString())
        currentY = eventY
        currentX = eventX
        view.invalidate()
    }

    override fun touchUp() {
        if(startingPositionY > currentY){
            val cy = currentY + this.getAttribute("cy").toFloat()
            this.setAttribute("cy", cy.toString())
        }
        if(startingPositionX > currentX){
            val cx = currentX + this.getAttribute("cx").toFloat()
            this.setAttribute("cx", cx.toString())
        }
    }

    override fun getString(): String {
        str = "<ellipse "
        val rx = this.getAttribute("rx")
        val ry = this.getAttribute("ry")
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
