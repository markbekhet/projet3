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
    override var startTransformPoint = Point(0f, 0f)
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
        val cxCert = this.getAttribute("cx").toFloat()
        val cyCert = this.getAttribute("cy").toFloat()
        startTransformPoint = Point(cxCert, cyCert)
        selected = true
        selectedTools.add(this)
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
        str += "<ellipse "
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

        str += " stroke=\"#000000\""
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

    override fun scale(view: View, scalePoint: Point) {

    }

    override fun translate(view:View, translationPoint: Point){
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transformTranslate",
            "translate(${translationPoint.x}," +
            "${translationPoint.y})")

        view.invalidate()
    }

    override fun getSelectionString(){
        str += "<rect "
        val rx = this.getAttribute("rx").toFloat()
        val ry = this.getAttribute("ry").toFloat()
        val x = this.getAttribute("cx").toFloat() - rx
        val y = this.getAttribute("cy").toFloat() - ry
        val width = rx * 2
        val height = ry * 2
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

}
