package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Picture
import android.view.View
import androidx.core.graphics.record
import com.caverock.androidsvg.RenderOptions
import com.caverock.androidsvg.SVG
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Document

class GalleryCanvasView(var widthSVG:Int, var heightSVG:Int ,var drawingId: Int,context: Context): View(context) {
    private var impl = SVGDOMImplementation.getDOMImplementation()
    private val doc: Document = impl.createDocument(svgNS, "svg", null)
    private var svgRoot = doc.createElementNS(svgNS, "g")

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        svgRoot.setAttribute("width", w.toString())
        svgRoot.setAttribute("height", h.toString())
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        val svgString = getSVGString()
        try{
            val svg = SVG.getFromString(svgString)
            svg.renderToCanvas(canvas)
        } catch(e: Exception){
            println(e.message)
        }


    }
    private fun getSVGString(): String{
        var str = "<svg xmlns=\"http://www.w3.org/2000/svg\" height=\"$heightSVG\" width=\"$widthSVG\">\n"
        str += "<g transform=\"scale(${0.3},${0.3})\">\n"
        var i = 0
        if(svgRoot.childNodes.length > 0){
            while(i < svgRoot.childNodes.length){
                val tool = svgRoot.childNodes.item(i) as Tool
                str += tool.getString()
                i++
            }
        }
        str +="</g>\n"
        str += "</svg>"
        //println(str)
        return str
    }
    fun parseExistingDrawings(existingContent: ArrayList<ContentDrawingSocket>){
        for(content in existingContent){
            if(content.content != null){
                try {
                    var newTool: Tool? = null
                    when(content.toolName){
                        ellipseString -> newTool = Ellipse(drawingId,
                            ellipseString, doc as AbstractDocument
                        )
                        rectString -> newTool = Rectangle(drawingId,
                            rectString, doc as AbstractDocument
                        )
                        pencilString -> newTool = FreeHand(drawingId,
                            pencilString, doc as AbstractDocument
                        )
                    }
                    newTool?.contentID = content.id!!
                    newTool?.selected = false
                    newTool?.parse(content.content)
                    svgRoot.appendChild(newTool)
                } catch(e: Exception){
                    println(e.message)
                }
            }
        }
    }
}
