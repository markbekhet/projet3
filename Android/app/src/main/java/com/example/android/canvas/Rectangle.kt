package com.example.android.canvas

import android.content.Context
import android.view.View
import com.example.android.SocketHandler
import com.example.android.client.ClientInfo
import org.apache.batik.anim.dom.SVGOMRectElement
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Element
import java.lang.Float.min
import kotlin.math.abs

open class Rectangle(private var drawingId: Int?,
                     prefix: String, owner: AbstractDocument):
                SVGOMRectElement(prefix, owner), Tool {
    override var currentX = 0f
    override var currentY = 0f
    override var selected = false
    override var str = "<rect "
    override var startTransformPoint = Point(0f, 0f)
    override var totalTranslation = Point(0f,0f)
    override var totalScaling = Point(0f,0f)
    override var scalingPositions = HashMap<Point, Point>()
    private var selectionOffset = 0f
    //override var drawingID = drawingId
    override var contentID: Int?= null
    //var abstractTool = AbstractTool(this)

    override fun touchStart(eventX: Float, eventY: Float, svgRoot: Element) {
        this.setAttribute("x", eventX.toString())
        this.setAttribute("y", eventY.toString())
        this.setAttribute("width", "0")
        this.setAttribute("height", "0")
        this.setAttribute("transform", "translate(0,0)")
        this.setAttribute("stroke-width", "${DrawingUtils.thickness}")
        this.setAttribute("stroke", DrawingUtils.primaryColor)
        this.setAttribute("fill", DrawingUtils.secondaryColor)
        //svgRoot.appendChild(this)
        requestCreation()
    }

    override fun touchMove(context: Context, eventX: Float, eventY: Float) {
        val width = abs(eventX - this.getAttribute("x").toFloat())
        val height = abs(eventY - this.getAttribute("y").toFloat())
        this.setAttribute("width", width.toString())
        this.setAttribute("height", height.toString())
        currentY = eventY
        currentX = eventX
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()

        this.setAttribute("y", min(currentY,y).toString())
        this.setAttribute("x", min(currentX,x).toString())
        if(contentID != null){
            sendProgressToServer(DrawingStatus.InProgress)
        }
    }

    override fun setCriticalValues(){
        val xCert = this.getAttribute("x").toFloat()
        val yCert = this.getAttribute("y").toFloat()
        val widthCert = this.getAttribute("width").toFloat()
        val heightCert = this.getAttribute("height").toFloat()
        startTransformPoint.x = xCert + (widthCert/2)
        startTransformPoint.y = yCert + (heightCert/2)
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
        }catch(e: Exception){}

        return str
    }

    override fun getOriginalString(): String {
        var result = "<rect "
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width")
        val height = this.getAttribute("height")
        val transform = this.getAttribute("transform")
        val stroke = this.getAttribute("stroke")
        val strokeWidth = this.getAttribute("stroke-width")
        val fill = this.getAttribute("fill")

        result += "x=\"${x}\" "
        result += "y=\"${y}\" "
        result += "width=\"$width\" "
        result += "height=\"$height\" "
        result += "transform=\"$transform\""
        result += " stroke=\"$stroke\""
        result += " stroke-width=\"$strokeWidth\""
        result += " fill=\"$fill\""

        result += "/>\n"
        return result
    }

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean{
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()

        val isInXAxes = eventX <= x + width + (2*selectionOffset) + totalTranslation.x
            && eventX >= x - selectionOffset + totalTranslation.x
        val isInYAxes = eventY <= y + height + (2*selectionOffset)+ totalTranslation.y
            && eventY >= y - selectionOffset + totalTranslation.y
        return isInXAxes && isInYAxes
    }

    override fun scale(view: View, scalePoint: Point , direction: Point) {
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()
        val minPoint = Point(x , y)
        val maxPoint = Point(x + width, y + height)
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
        this.setAttribute("y", min(minPoint.y,maxPoint.y).toString())
        this.setAttribute("x", min(minPoint.x,maxPoint.x).toString())
        this.setAttribute("width", abs(maxPoint.x - minPoint.x).toString())
        this.setAttribute("height", abs(maxPoint.y - minPoint.y).toString())
        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun translate(view: View, translationPoint: Point) {
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transform",
            "translate(${totalTranslation.x},${totalTranslation.y})")
        sendProgressToServer(DrawingStatus.Selected)

    }

    override fun getSelectionString() {
        str += "<rect "
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()
        val transform = this.getAttribute("transform")

        str += "x=\"${x}\" "
        str += "y=\"${y}\" "
        str += "width=\"${width}\" "

        str += "height=\"${height}\" "
        str += "transform=\"${transform}\""

        str += " stroke=\"#0000FF\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\""
        str += " stroke-dasharray=\"4\""
        str += "/>\n"
    }

    override fun calculateScalingPositions() {
        scalingPositions.clear()
        val width = this.getAttribute("width").toFloat()
        val height = this.getAttribute("height").toFloat()
        val x = this.getAttribute("x").toFloat()
        val y = this.getAttribute("y").toFloat()
        val firstPos = Point(x + totalTranslation.x, y + totalTranslation.y)
        val firstDirection = Point(-1f, -1f)
        scalingPositions[firstPos] = firstDirection

        val secondPos = Point(x + (width/2) + totalTranslation.x, y + totalTranslation.y)
        scalingPositions[secondPos] = Point(0f,-1f)

        val thirdPos = Point(x + width + totalTranslation.x, y + totalTranslation.y)
        scalingPositions[thirdPos] = Point(1f, -1f)

        val forthPos = Point(x + width + totalTranslation.x,
            y + (height/2) + totalTranslation.y)
        scalingPositions[forthPos] = Point(1f, 0f)

        val fifthPos = Point(x + width + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[fifthPos] = Point(1f, 1f)

        val sixthPos = Point(x + (width/2) + totalTranslation.x
            , y + height + totalTranslation.y)
        scalingPositions[sixthPos] = Point(0f, 1f)

        val seventhPos = Point(x + totalTranslation.x
            , y + height + totalTranslation.y)
        scalingPositions[seventhPos] = Point(-1f, 1f)

        val eighthPos = Point(x + totalTranslation.x ,
            y + (height/2) + totalTranslation.y)
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
        val xRegex = Regex("""x="([-?0-9.?]*)"""")
        val matchX = xRegex.find(parceableString!!, 1)
        this.setAttribute("x", matchX!!.groups[1]!!.value)
        val yRegex = Regex("""y="([-?0-9.?]*)"""")
        val matchY = yRegex.find(parceableString,1)
        this.setAttribute("y", matchY!!.groups[1]!!.value)
        val widthRegex = Regex("""width="([-?0-9.?]*)""")
        val matchWidth = widthRegex.find(parceableString,1)
        this.setAttribute("width", matchWidth!!.groups[1]!!.value)
        val heightRegex = Regex("""height="([-?0-9.?]*)"""")
        val matchHeight = heightRegex.find(parceableString,1)
        this.setAttribute("height", matchHeight!!.groups[1]!!.value)

        //Commune between tools
        val translateRegex = Regex("""translate\(([-?0-9.?]+),([-?0-9.?]+)\)""")
        val matchTranslate = translateRegex.find(parceableString, 1)
        totalTranslation.x = matchTranslate!!.groups[1]!!.value.toFloat()
        totalTranslation.y = matchTranslate.groups[2]!!.value.toFloat()
        this.setAttribute("transform",
            "translate(${totalTranslation.x},${totalTranslation.y})")
        //strokeParse
        val strokeRegex = Regex("""stroke="([#a-zA-Z0-9]+)"""")
        val matchStroke = strokeRegex.find(parceableString, 1)
        this.setAttribute("stroke", matchStroke!!.groups[1]!!.value)
        val strokeWidthRegex = Regex("""stroke-width="([0-9]+)"""")
        val matchStrokeWidth = strokeWidthRegex.find(parceableString, 1)
        this.setAttribute("stroke-width", matchStrokeWidth!!.groups[1]!!.value)
        val fillRegex = Regex("""fill="([#a-zA-Z0-9]+ |none)"""")
        val matchFill = fillRegex.find(parceableString)
        this.setAttribute("fill", matchFill!!.groups[1]!!.value)
        setCriticalValues()
    }

    protected fun sendProgressToServer(status: DrawingStatus){
        val drawingContent = ContentDrawingSocket(
            drawingId = drawingId, userId = ClientInfo.userId,
            contentId = contentID, drawing= getOriginalString(),
            status = status, toolName = rectString)
        val socket = SocketHandler.getDrawingSocket()
        socket.emit("drawingToServer", drawingContent.toJson())
    }

    protected fun requestCreation(){
        SocketHandler.getDrawingSocket()
            .emit("createDrawingContent",
                RequestCreation(drawingId).toJson())
    }

    override  fun unselect(){
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
