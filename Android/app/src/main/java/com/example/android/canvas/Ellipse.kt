package com.example.android.canvas

import android.content.Context
import android.view.View
import com.example.android.SocketHandler
import com.example.android.client.ClientInfo
import org.apache.batik.anim.dom.SVGOMEllipseElement
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Element
import java.lang.Float.min
import kotlin.math.abs

class Ellipse(private var drawingId:Int? ,
              prefix: String, owner: AbstractDocument):
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
    //override var drawingID = drawingId
    override var contentID: Int?=null

    override fun touchStart(eventX: Float, eventY: Float, svgRoot: Element) {
        startingPositionX = eventX
        startingPositionY = eventY
        this.setAttribute("rx", "0")
        this.setAttribute("ry", "0")
        this.setAttribute("cx",eventX.toString())
        this.setAttribute("cy",eventY.toString())
        this.setAttribute("transformTranslate","translate(0,0)")
        this.setAttribute("stroke-width", "${DrawingUtils.thickness}")
        this.setAttribute("stroke", DrawingUtils.primaryColor)
        this.setAttribute("fill", DrawingUtils.secondaryColor)
        //svgRoot.appendChild(this)
        requestCreation()
    }

    override fun touchMove(context: Context, eventX: Float, eventY: Float) {
        val rx = abs(eventX - startingPositionX)/2
        val ry = abs(eventY - startingPositionY)/2
        this.setAttribute("rx", rx.toString())
        this.setAttribute("ry", ry.toString())
        this.setAttribute("cx",(min(startingPositionX+rx, currentX + rx)).toString())
        this.setAttribute("cy",(min(startingPositionY+ry, currentY + ry)).toString())

        currentY = eventY
        currentX = eventX
        if(contentID != null){
            sendProgressToServer(DrawingStatus.InProgress)
        }
    }

    override fun setCriticalValues(){
        val cxCert = this.getAttribute("cx").toFloat()
        val cyCert = this.getAttribute("cy").toFloat()
        startTransformPoint = Point(cxCert, cyCert)
    }

    override fun touchUp() {
        setCriticalValues()
        calculateScalingPositions()
        select()
    }

    override fun getString(): String {
        str = ""
        try{
            str += getOriginalString()
            if(selected){
                getSelectionString()
                getScalingPositionsString()
            }
        } catch(e: Exception){}
        return str
    }

    override fun getOriginalString(): String{
        var result = "<ellipse "
        val rx = this.getAttribute("rx")
        val ry = this.getAttribute("ry")
        val transform = this.getAttribute("transformTranslate")
        val stroke = this.getAttribute("stroke")
        val strokeWidth = this.getAttribute("stroke-width")
        val fill = this.getAttribute("fill")

        val mx = this.getAttribute("cx")
        result += "cx=\"$mx\" "

        val my = this.getAttribute("cy")
        result += "cy=\"$my\" "

        rx?.let{
            result += "rx=\"$it\" "
        }
        ry?.let{
            result += "ry=\"$it\" "
        }

        transform?.let{
            result += "transform=\"$it\""
        }
        result += " stroke-width=\"$strokeWidth\""
        result += " fill=\"$fill\""

        result += " stroke=\"$stroke\""
        result += "/>\n"
        return result
    }

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean{
        val cx = this.getAttribute("cx").toFloat()
        val cy = this.getAttribute("cy").toFloat()
        val rx = this.getAttribute("rx").toFloat()
        val ry = this.getAttribute("ry").toFloat()

        val isInXAxes = eventX <= cx + rx + totalTranslation.x - (radius * 2)
            && eventX >= cx - rx + totalTranslation.x - (radius * 2)
        val isInYAxes = eventY <= cy + ry + totalTranslation.y - (radius * 2)
            && eventY >= cy - ry + totalTranslation.y - (radius * 2)
        return isInXAxes && isInYAxes
    }

    override fun scale(view: View, scalePoint: Point , direction: Point) {
        val cx = this.getAttribute("cx").toFloat()
        val cy = this.getAttribute("cy").toFloat()
        val rx = this.getAttribute("rx").toFloat()
        val ry = this.getAttribute("ry").toFloat()
        val minPoint = Point(cx - rx , cy - ry)
        val maxPoint = Point(cx + rx, cy + ry)
        if(direction.x == -1f){
            println(minPoint.x)
            minPoint.x += scalePoint.x
            println(minPoint.x)
            currentX = minPoint.x
        }
        else if(direction.x == 1f){
            maxPoint.x += scalePoint.x
        }
        if(direction.y == -1f){
            minPoint.y += scalePoint.y
            currentY = minPoint.y
        }
        else if(direction.y == 1f){
            maxPoint.y += scalePoint.y
        }

        if(minPoint.x >= maxPoint.x){
            direction.x *= -1
        }

        if(minPoint.y >= maxPoint.y){
            direction.y *= -1
        }
        this.setAttribute("rx", (abs(maxPoint.x - minPoint.x)/2).toString())
        this.setAttribute("ry", (abs(maxPoint.y - minPoint.y)/2).toString())

        val newRx = this.getAttribute("rx").toFloat()
        val newRy = this.getAttribute("ry").toFloat()
        this.setAttribute("cy", (min(minPoint.y,maxPoint.y) + newRy).toString())
        this.setAttribute("cx", (min(minPoint.x,maxPoint.x) + newRx).toString())
        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun translate(view:View, translationPoint: Point){
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transformTranslate",
            "translate(${translationPoint.x}," +
            "${translationPoint.y})")

        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun getSelectionString(){
        try{
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
            str += " fill=\"none\""
            str += " stroke-dasharray=\"4\""
            str += "/>\n"
        } catch(e: Exception){}

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

        val eighthPos = Point(cx - rx + totalTranslation.x , cy + totalTranslation.y)
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

    override fun parse(parceableString: String?){
        val cxRegex = Regex("""cx="([-?0-9.?]*)"""")
        val matchCX = cxRegex.find(parceableString!!, 1)
        this.setAttribute("cx", matchCX!!.groups[1]!!.value)
        val cyRegex = Regex("""cy="([-?0-9.?]*)"""")
        val matchCY = cyRegex.find(parceableString,1)
        this.setAttribute("cy", matchCY!!.groups[1]!!.value)
        val rxRegex = Regex("""rx="([-?0-9.?]*)""")
        val matchRX = rxRegex.find(parceableString,1)
        this.setAttribute("rx", matchRX!!.groups[1]!!.value)
        val ryRegex = Regex("""ry="([-?0-9.?]*)"""")
        val matchRY = ryRegex.find(parceableString,1)
        this.setAttribute("ry", matchRY!!.groups[1]!!.value)

        //Commune between tools
        val translateRegex = Regex("""translate\(([-?0-9.?]+),([-?0-9.?]+)\)""")
        val matchTranslate = translateRegex.find(parceableString, 1)
        totalTranslation.x = matchTranslate!!.groups[1]!!.value.toFloat()
        totalTranslation.y = matchTranslate.groups[2]!!.value.toFloat()
        this.setAttribute("transformTranslate",
            "translate(${totalTranslation.x},${totalTranslation.y})")
        //strokeParse
        val strokeRegex = Regex("""stroke="([#a-zA-Z0-9]+)"""")
        val matchStroke = strokeRegex.find(parceableString, 1)
        this.setAttribute("stroke", matchStroke!!.groups[1]!!.value)
        val strokeWidthRegex = Regex("""stroke-width="([0-9]+)"""")
        val matchStrokeWidth = strokeWidthRegex.find(parceableString, 1)
        this.setAttribute("stroke-width", matchStrokeWidth!!.groups[1]!!.value)
        val fillRegex = Regex("""fill="([#a-zA-Z0-9]+| none)"""")
        val matchFill = fillRegex.find(parceableString)
        this.setAttribute("fill", matchFill!!.groups[1]!!.value)
        setCriticalValues()
    }

    private fun sendProgressToServer(status: DrawingStatus){
        val drawingContent = ContentDrawingSocket(
            drawingId = drawingId, userId = ClientInfo.userId,
            contentId = contentID, drawing= getOriginalString(),
            status = status, toolName = ellipseString)
        val socket = SocketHandler.getDrawingSocket()
        socket.emit("drawingToServer", drawingContent.toJson())
    }

    private fun requestCreation(){
        SocketHandler.getDrawingSocket()
            .emit("createDrawingContent",
                RequestCreation(drawingId).toJson())
    }

    override fun unselect(){
        sendProgressToServer(DrawingStatus.Done)
        selected = false
    }

    override fun select(){
        selected = true
        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun delete(){
        sendProgressToServer(DrawingStatus.Deleted)
    }

    override fun updateThickness() {
        this.setAttribute("stroke-width", "${DrawingUtils.thickness}")
        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun updatePrimaryColor() {
        this.setAttribute("stroke", DrawingUtils.primaryColor)
        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun updateSecondaryColor() {
        this.setAttribute("fill", DrawingUtils.secondaryColor)
        sendProgressToServer(DrawingStatus.Selected)
    }
}
