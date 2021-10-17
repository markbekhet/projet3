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
    override var selected = false
    override var str = "<ellipse "
    private var startingPositionX = 0f
    private var startingPositionY = 0f
    override lateinit var startTransformPoint: Point
    override var totalTranslation = Point(0f, 0f)

    override fun touchStart(view: View, eventX: Float, eventY: Float) {
        startingPositionX = eventX
        startingPositionY = eventY
        this.setAttribute("rx", "0")
        this.setAttribute("ry", "0")
        this.setAttribute("cx",eventX.toString())
        this.setAttribute("cy",eventY.toString())
        this.setAttribute("transformTranslate","")
        view.invalidate()
    }

    override fun touchMove(view: View, context: Context, eventX: Float, eventY: Float) {
        val rx = abs(eventX - startingPositionX)/2
        val ry = abs(eventY - startingPositionY)/2
        this.setAttribute("rx", rx.toString())
        this.setAttribute("ry", ry.toString())
        this.setAttribute("cx",(startingPositionX+rx).toString())
        this.setAttribute("cy",(startingPositionY+ry).toString())
        this.setAttribute("transform", "")
        currentY = eventY
        currentX = eventX
        view.invalidate()
    }

    override fun touchUp(view: View, selectedTools: ArrayList<Tool>) {
        if(startingPositionY > currentY){
            val cy = currentY + this.getAttribute("ry").toFloat()
            this.setAttribute("cy", cy.toString())
        }
        if(startingPositionX > currentX){
            val cx = currentX + this.getAttribute("rx").toFloat()
            this.setAttribute("cx", cx.toString())
        }
        selected = true
        selectedTools.add(this)
        view.invalidate()
    }

    override fun getString(): String {
        getString(selected)
        return str
    }

    override fun getString(selectionActive: Boolean){
        str = "<ellipse "
        val rx = this.getAttribute("rx")
        val ry = this.getAttribute("ry")
        val transform = this.getAttribute("transformTranslate")
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

        transform?.let{
            str += "transform=\"$it\""
        }
        str += " stroke-width=\"3\""
        str += " fill=\"none\"";

        if(selectionActive){
            str += " stroke-dasharray=\"4\""
            str += " stroke=\"#0000FF\""
        }
        else{
            str += " stroke=\"#000000\""
        }

        str += "/>\n"
    }

    override fun containsPoint(eventX: Float, eventY: Float): Boolean{
        val cx = this.getAttribute("cx").toFloat()
        val cy = this.getAttribute("cy").toFloat()
        val rx = this.getAttribute("rx").toFloat()
        val ry = this.getAttribute("ry").toFloat()

        val isInXAxes = eventX <= cx + rx + totalTranslation.x
            && eventX >= cx - rx + totalTranslation.x
        val isInYAxes = eventY <= cy + ry + totalTranslation.y
            && eventY >= cy - ry + totalTranslation.y
        return isInXAxes && isInYAxes
    }

    override fun translate(view:View, eventX: Float, eventY: Float){
        totalTranslation.x = eventX - startTransformPoint.x
        totalTranslation.y = eventY - startTransformPoint.y
        //val transformString = this.getAttribute("transform")
        this.setAttribute("transformTranslate",
            "translate(${totalTranslation.x}," +
            "${totalTranslation.y})")

        view.invalidate()
    }

}
