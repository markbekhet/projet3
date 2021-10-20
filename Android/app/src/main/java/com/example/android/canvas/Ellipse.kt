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
    override var totalScaling = Point(0f,0f)
    override var scalingPositions = HashMap<Point, Point>()

    override fun touchStart(view: View, eventX: Float, eventY: Float) {
        startingPositionX = eventX
        startingPositionY = eventY
        this.setAttribute("rx", "0")
        this.setAttribute("ry", "0")
        this.setAttribute("cx",eventX.toString())
        this.setAttribute("cy",eventY.toString())
        this.setAttribute("transformTranslate","")
        this.setAttribute("transformScale", "")
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
        if(!selectedTools.contains(this)){
            selectedTools.add(this)
        }

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

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean{
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

    override fun scale(view: View, scalePoint: Point , direction: Point) {

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

    override fun calculateScalingPositions() {
        scalingPositions.clear()
        val rx = this.getAttribute("rx").toFloat()
        val ry = this.getAttribute("ry").toFloat()
        val cx = this.getAttribute("cx").toFloat()
        val cy = this.getAttribute("cy").toFloat()
        val firstPos = Point(cx - rx + totalTranslation.x, cy - ry  + totalTranslation.y)
        val firstDirection = Point(-1f, -1f)
        scalingPositions[firstPos] = firstDirection

        val secondPos = Point(cx + totalTranslation.x, cy - ry + totalTranslation.y)
        scalingPositions[secondPos] = Point(0f,-1f)

        val thirdPos = Point(cx + rx + totalTranslation.x, cy - ry+ + totalTranslation.y)
        scalingPositions[thirdPos] = Point(1f, -1f)

        val forthPos = Point(cx + rx + totalTranslation.x, cy + totalTranslation.y)
        scalingPositions[forthPos] = Point(1f, 0f)

        val fifthPos = Point(cx + rx + totalTranslation.x, cy + ry + totalTranslation.y)
        scalingPositions[fifthPos] = Point(1f, 1f)

        val sixthPos = Point(cx + totalTranslation.x, cy + ry + totalTranslation.y)
        scalingPositions[sixthPos] = Point(0f, 1f)

        val seventhPos = Point(cx - rx + totalTranslation.x, cy + ry + totalTranslation.y)
        scalingPositions[seventhPos] = Point(-1f, 1f)

        val eighthPos = Point(cx + rx + totalTranslation.x , cy + totalTranslation.y)
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
