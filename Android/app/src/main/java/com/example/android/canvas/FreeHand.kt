package com.example.android.canvas

import android.content.Context
import android.view.View
import com.example.android.SocketHandler
import com.example.android.client.ClientInfo
import org.apache.batik.anim.dom.SVGOMPolylineElement
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Element
import java.lang.Float.min
import kotlin.math.max

class FreeHand(private var drawingId: Int?,
               prefix: String, owner: AbstractDocument) :
            Tool, SVGOMPolylineElement(prefix, owner)
{
    override var currentX = 0f
    override var currentY = 0f
    override var selected = false
    override var str = "<polyline "
    override  var startTransformPoint = Point(0f,0f)
    override var totalTranslation = Point(0f,0f)
    private var minPoint = Point(Float.MAX_VALUE,Float.MAX_VALUE)
    private var maxPoint = Point(0f, 0f)
    override var totalScaling = Point(0f, 0f)
    override var scalingPositions = HashMap<Point, Point>()
    //override var drawingID = drawingId!!.toInt()
    override var contentID: Int? = null

    override fun touchStart(eventX: Float, eventY:Float, svgRoot: Element){
        this.setAttribute("points", "$eventX $eventY")
        this.setAttribute("transform", "translate(0,0)")
        this.setAttribute("stroke-width", "${DrawingUtils.thickness}")
        this.setAttribute("stroke", DrawingUtils.primaryColor)
        //svgRoot.appendChild(this)
        requestCreation()
    }

    override fun touchMove(context: Context,
                           eventX: Float,
                           eventY: Float)
    {
        val existingPoints = this.getAttribute("points")
        this.setAttribute("points", "$existingPoints,$eventX $eventY")
        if(contentID != null){
            sendProgressToServer(DrawingStatus.InProgress)
        }
    }

    override fun touchUp() {
        setCriticalValues()
        calculateScalingPositions()
        select()
    }

    override fun getString(): String {
        str = ""
        str += getOriginalString()
        if(selected){
            getSelectionString()
            getScalingPositionsString()
        }
        return str
    }

    override fun getOriginalString(): String{
        var result = "<polyline "
        val startPoint = this.getAttribute("points")
        val translate = this.getAttribute("transform")
        val stroke = this.getAttribute("stroke")
        val strokeWidth = this.getAttribute("stroke-width")
        result += "points=\"$startPoint\" "
        result += "transform=\"$translate\" "
        result += " stroke=\"$stroke\""
        result += " stroke-width=\"$strokeWidth\""
        result += " fill=\"none\""
        result += " stroke-linecap=\"round\""
        result += " stroke-linejoin=\"round\""
        result += "/>\n"
        return result
    }

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean{
        val inXAxes = (eventX >= minPoint.x + totalTranslation.x)
            && (eventX <= maxPoint.x + totalTranslation.x)
        val inYaxes = (eventY >= minPoint.y + totalTranslation.y)
            && (eventY <= maxPoint.y + totalTranslation.y)
        return inXAxes && inYaxes
    }

    override fun scale(view: View, scalePoint: Point , direction: Point) {
        // Needs implementing
        val oldWidth = maxPoint.x - minPoint.x
        val oldHeight = maxPoint.y - minPoint.y
        if(direction.x == -1f){
            minPoint.x += scalePoint.x
            //currentX = minPoint.x
        }
        else if(direction.x == 1f){
            maxPoint.x += scalePoint.x
        }
        if(direction.y == -1f){
            minPoint.y += scalePoint.y
            //currentY = minPoint.y
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

        val newWidth = maxPoint.x - minPoint.x
        val newHeight = maxPoint.y - minPoint.y
        val ratioWidth = newWidth / oldWidth
        val ratioHeight = newHeight / oldHeight

        var differenceWidth = 0f
        var differenceHeight = 0f
        if(direction.x == -1f){
            differenceWidth = (maxPoint.x * ratioWidth) - maxPoint.x
        }
        else if(direction.x == 1f){
            differenceWidth = (minPoint.x * ratioWidth) - minPoint.x
        }

        if(direction.y == -1f){
            differenceHeight = (maxPoint.y* ratioHeight) - maxPoint.y
        }
        else if(direction.y == 1f){
            differenceHeight = (minPoint.y * ratioHeight) - minPoint.y
        }

        val polylinePoints = this.points.points
        if(polylinePoints.numberOfItems > 0){
            var i = 0
            while(i < polylinePoints.numberOfItems){
                val item = polylinePoints.getItem(i)
                item.x *= ratioWidth
                item.x -= differenceWidth
                item.y *= ratioHeight
                item.y -= differenceHeight
                i++
            }
        }
        setCriticalValues()
        calculateScalingPositions()
        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun translate(view:View, translationPoint: Point){
        totalTranslation.makeEqualTo(translationPoint)
        this.setAttribute("transform",
            "translate(${totalTranslation.x}," +
            "${totalTranslation.y})")
        calculateScalingPositions()
        sendProgressToServer(DrawingStatus.Selected)
    }

    override fun getSelectionString() {
        str += "<rect "
        val x = minPoint.x
        val y = minPoint.y
        val width = maxPoint.x - minPoint.x
        val height = maxPoint.y - minPoint.y
        str += "x=\"$x\" "
        str += "y=\"$y\" "
        str += "width=\"$width\""
        str += "height=\"$height\""
        val transform = this.getAttribute("transform")
        transform?.let{
            str += "transform=\"$it\""
        }
        str += " stroke=\"#0000FF\""
        str += " stroke-width=\"3\""
        str += " fill=\"none\""
        str += " stroke-dasharray=\"4\""
        str += "/>\n"
    }

    override fun setCriticalValues(){
        minPoint = Point(Float.MAX_VALUE,Float.MAX_VALUE)
        maxPoint = Point(0f, 0f)
        val polylinePoints = this.points.points
        if(polylinePoints.numberOfItems > 0){
            var i = 0
            while(i < polylinePoints.numberOfItems){
                val item = polylinePoints.getItem(i)
                minPoint.x = min(item.x, minPoint.x)
                minPoint.y = min(item.y, minPoint.y)
                maxPoint.x = max(item.x, maxPoint.x)
                maxPoint.y = max(item.y, maxPoint.y)
                i++
            }
            startTransformPoint =
                Point(
                    polylinePoints.getItem(polylinePoints.numberOfItems/2).x
                    ,polylinePoints.getItem(polylinePoints.numberOfItems/2).y)
        }
    }

    override fun calculateScalingPositions() {
        scalingPositions.clear()
        val width = maxPoint.x - minPoint.x
        val height = maxPoint.y - minPoint.y
        val x = minPoint.x
        val y = minPoint.y

        val firstPos = Point(x + totalTranslation.x,
            y + totalTranslation.y)
        val firstDirection = Point(-1f, -1f)
        scalingPositions[firstPos] = firstDirection

        val secondPos = Point(x + (width/2) + totalTranslation.x
            , y + totalTranslation.y)
        scalingPositions[secondPos] = Point(0f,-1f)

        val thirdPos = Point(x + width + totalTranslation.x,
            y + totalTranslation.y)
        scalingPositions[thirdPos] = Point(1f, -1f)

        val forthPos = Point(x + width + totalTranslation.x,
            y + (height/2) + totalTranslation.y)
        scalingPositions[forthPos] = Point(1f, 0f)

        val fifthPos = Point(x + width + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[fifthPos] = Point(1f, 1f)

        val sixthPos = Point(x + (width/2) + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[sixthPos] = Point(0f, 1f)

        val seventhPos = Point(x + totalTranslation.x,
            y + height + totalTranslation.y)
        scalingPositions[seventhPos] = Point(-1f, 1f)

        val eighthPos = Point(x + totalTranslation.x,
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

    private fun requestCreation(){
        SocketHandler.getDrawingSocket()
            .emit("createDrawingContent",
                RequestCreation(drawingId).toJson())
    }

    override fun parse(parceableString: String?){
        val pointsRegex = Regex(
            """points="([-?0-9.?]*( )*[-?0-9.?]*(,[-?0-9.?]*( )*[-?0-9.?]*)*)"""")
        val matchPoints = pointsRegex.find(parceableString!!, 1)
        // Point exist in group 1
        this.setAttribute("points", matchPoints!!.groups[1]!!.value)
        val translateRegex = Regex("""translate\(([-?0-9.?]+),([-?0-9.?]+)\)""")
        val matchTranslate = translateRegex.find(parceableString,1)
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
        setCriticalValues()
    }

    private fun sendProgressToServer(status: DrawingStatus){
        val drawingContent = ContentDrawingSocket(
            drawingId = drawingId, userId = ClientInfo.userId,
            contentId = contentID, drawing= getOriginalString(),
            status = status, toolName = pencilString)
        val socket = SocketHandler.getDrawingSocket()
        socket.emit("drawingToServer", drawingContent.toJson())
    }

    override fun unselect(){
        selected = false
        sendProgressToServer(DrawingStatus.Done)
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

    override fun updateSecondaryColor() {/*Not needed*/}
}
