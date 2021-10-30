package com.example.android.canvas

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.view.MotionEvent
import android.view.View
import androidx.core.content.res.ResourcesCompat
import com.caverock.androidsvg.SVG
import com.example.android.R
import com.example.android.SocketHandler
import io.socket.client.Socket
import org.apache.batik.anim.dom.*
import org.apache.batik.dom.AbstractDocument
import org.apache.batik.dom.svg.AbstractSVGTransformList
import org.apache.batik.dom.svg.SVGSVGContext
import org.apache.batik.util.SVGFeatureStrings
import org.json.JSONObject
import org.w3c.dom.Document
import org.w3c.dom.svg.GetSVGDocument
import org.w3c.dom.svg.SVGAnimatedString
import org.w3c.dom.svg.SVGElement
import org.w3c.dom.svg.SVGTransform
import org.xml.sax.helpers.XMLReaderFactory
import org.xmlpull.v1.XmlSerializer
import java.lang.RuntimeException

private const val STROKE_WIDTH = 12f // has to be float
val svgNS = SVGDOMImplementation.SVG_NAMESPACE_URI

class CanvasView(context: Context): View(context) {
    private var selectedTools = ArrayList<Tool>()
    private var width: String = "100"
    private var height: String = "100"

    private var socket = SocketHandler.getDrawingSocket()
    // Drawing utils
    private var tool: Tool? = null
    private var impl = SVGDOMImplementation.getDOMImplementation()
    private val doc: Document= impl.createDocument(svgNS, "svg", null)
    private var svgRoot = doc.createElementNS(svgNS, "g")
    private var drawingId = 1
    //copy doc and svgRoot to manipulate
    private val docCopy: Document= impl.createDocument(svgNS, "svg", null)
    private var svgRootCopy = docCopy.createElementNS(svgNS, "g")
    //Action attributes
    var mode = ""
    var scalingPoint : MutableMap.MutableEntry<Point, Point>? = null
    var totalScaling = Point(0f,0f)


    override fun onTouchEvent(event: MotionEvent?): Boolean {
        try{
            when(event?.action){
                MotionEvent.ACTION_DOWN -> {
                    if(tool != null){
                        scalingPoint = tool!!.getScalingPoint(Point(event.x , event.y))
                        totalScaling.makeEqualTo(Point(0f,0f))
                    }
                    if(scalingPoint != null){
                        mode = "scaling"
                    }
                    else if(isInsideTheSelection(event.x , event.y)){
                        mode = "translation"
                    }
                    else{
                        unSelectAllChildren()
                        when(DrawingUtils.currentTool){
                            selectionString -> tool = Selection()
                            ellipseString -> tool = Ellipse(drawingId,
                                ellipseString, docCopy as AbstractDocument)
                            rectString -> tool = Rectangle(drawingId,
                                rectString, docCopy as AbstractDocument)
                            pencilString -> tool = FreeHand(drawingId,
                                pencilString, docCopy as AbstractDocument)
                        }
                        tool!!.touchStart( event.x, event.y, svgRootCopy)
                        mode = ""
                    }
                }
                MotionEvent.ACTION_MOVE ->{
                    if(DrawingUtils.currentTool == selectionString){
                        when(mode){
                            "translation" ->{
                                val translation:Point = tool!!.startTransformPoint
                                    .difference(Point(event.x, event.y))
                                tool!!.translate(this, translation)
                            }
                            "scaling" ->{
                                val scalingFactor =
                                    Point(event.x - scalingPoint!!.key.x - totalScaling.x ,
                                        event.y - scalingPoint!!.key.y - totalScaling.y)
                                tool!!.scale(this, scalingFactor, scalingPoint!!.value)
                                totalScaling.plus(scalingFactor)
                            }
                        }
                    }
                    else{
                        when(mode){
                            "translation" ->{
                                val translation:Point = tool!!.startTransformPoint
                                    .difference(Point(event.x, event.y))
                                tool!!.translate(this, translation)
                            }
                            "scaling" ->{
                                val scalingFactor =
                                    Point(event.x - scalingPoint!!.key.x - totalScaling.x ,
                                        event.y - scalingPoint!!.key.y - totalScaling.y)
                                tool!!.scale(this, scalingFactor, scalingPoint!!.value)
                                totalScaling.plus(scalingFactor)
                            }
                            else -> tool!!.touchMove(context,event.x, event.y)
                        }
                    }
                }
                MotionEvent.ACTION_UP -> tool!!.touchUp()
            }
        } catch(e: Exception){}


        return true
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        svgRoot.setAttribute("width", w.toString())
        svgRoot.setAttribute("height", h.toString())
        width = w.toString()
        height = h.toString()
    }

    fun receiveContentID(json: JSONObject){
        val getContentId = GetContentId(0).fromJson(json.toString())
        tool!!.contentID = getContentId.contentId
    }

    fun onReceivedDrawing(drawingContent: ContentDrawingSocket){
        manipulateReceivedDrawing(drawingContent)
        invalidate()
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        socket.on("drawingContentCreated"){ args ->
            if(args[0] != null){
                val data = args[0] as JSONObject
                receiveContentID(data)
            }
        }

        val svgString = getSVGString()
        try{
            val svg = SVG.getFromString(svgString)
            svg.renderToCanvas(canvas)
        } catch(e: Exception){
            println(e.message)
        }


    }

    private fun getSVGString(): String{
        var str = "<svg width=\"${width}\" height=\"${height}\" xmlns=\"http://www.w3.org/2000/svg\">\n"
        var i = 0
        if(svgRoot.childNodes.length > 0){
            while(i < svgRoot.childNodes.length){
                val tool = svgRoot.childNodes.item(i) as Tool
                str += tool.getString()
                i++
            }
        }

        str += "</svg>"
        //println(str)
        return str
    }

    private fun isInsideTheSelection(eventX: Float, eventY: Float): Boolean{
        if(tool != null && tool!!.inTranslationZone(eventX, eventY)){
            return true
        }
        return false
    }

    private fun unSelectAllChildren(){
        if(tool != null){
            tool!!.unselect()
        }
    }

    private fun manipulateReceivedDrawing(drawingContent: ContentDrawingSocket){
        var i = 0
        var exist = false
        if(svgRoot.childNodes.length > 0){
            while(i < svgRoot.childNodes.length){
                val tool = svgRoot.childNodes.item(i) as Tool
                if(tool.contentID == drawingContent.contentId){
                    try{
                        tool.parse(drawingContent.drawing)
                    } catch(e: Exception){}
                    exist = true
                    tool.selected = drawingContent.status == DrawingStatus.Selected

                    if(drawingContent.status == DrawingStatus.Deleted){
                        svgRoot.removeChild(tool)
                    }

                    break
                }
                i++
            }
        }
        if(!exist){
            try {
                var newTool: Tool? = null
                when(drawingContent.toolName){
                    ellipseString -> newTool = Ellipse(drawingId,
                        ellipseString, doc as AbstractDocument)
                    rectString -> newTool = Rectangle(drawingId,
                        rectString, doc as AbstractDocument)
                    pencilString -> newTool = FreeHand(drawingId,
                        pencilString, doc as AbstractDocument)
                }
                newTool?.contentID = drawingContent.contentId!!
                newTool?.selected = drawingContent.status == DrawingStatus.Selected
                newTool?.parse(drawingContent.drawing)
                svgRoot.appendChild(newTool)
            } catch(e: Exception){
                println(e.message)
            }

        }
    }
    fun deleteTool(){
        if(tool != null){
            tool!!.delete()
            tool = null
        }
    }

    fun updateToolPrimaryColor(){
        if(tool != null){
            tool!!.updatePrimaryColor()
        }
    }

    fun updateToolSecondaryColor(){
        if(tool != null){
            tool!!.updateSecondaryColor()
        }
    }

    fun updateToolThickness(){
        if(tool != null){
            tool!!.updateThickness()
        }
    }
}
