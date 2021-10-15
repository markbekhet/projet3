package com.example.android.canvas

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.view.MotionEvent
import android.view.View
import androidx.core.content.res.ResourcesCompat
import com.caverock.androidsvg.SVG
import com.example.android.R
import org.apache.batik.anim.dom.*
import org.apache.batik.dom.AbstractDocument
import org.apache.batik.dom.svg.AbstractSVGTransformList
import org.apache.batik.dom.svg.SVGSVGContext
import org.apache.batik.util.SVGFeatureStrings
import org.w3c.dom.Document
import org.w3c.dom.svg.GetSVGDocument
import org.w3c.dom.svg.SVGAnimatedString
import org.w3c.dom.svg.SVGElement
import org.w3c.dom.svg.SVGTransform
import org.xml.sax.helpers.XMLReaderFactory
import org.xmlpull.v1.XmlSerializer

private const val STROKE_WIDTH = 12f // has to be float
val svgNS = SVGDOMImplementation.SVG_NAMESPACE_URI

class CanvasView(context: Context): View(context) {
    private lateinit var bitmap: Bitmap
    private lateinit var canvas: Canvas
    private var width: String = "100"
    private var height: String = "100"

    private lateinit var tool: Tool

    private var impl = SVGDOMImplementation.getDOMImplementation()
    private val doc: Document= impl.createDocument(svgNS, "svg", null)
    // Get the root element (the 'svg' element).
    private var svgRoot = doc.createElementNS(svgNS, "g")


    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent?): Boolean {
        when(event?.action){
            MotionEvent.ACTION_DOWN -> {
                tool = Ellipse("ellipse", doc as AbstractDocument)
                tool.touchStart(doc, event.x, event.y)
                svgRoot.appendChild(tool)
            }
            MotionEvent.ACTION_MOVE -> tool.touchMove(this, context,
                event!!.x, event!!.y)
            MotionEvent.ACTION_UP -> tool.touchUp()
        }

        return true
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        svgRoot.setAttribute("width", w.toString())
        svgRoot.setAttribute("height", h.toString())
        width = w.toString()
        height = h.toString()
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        val svgString = getSvgString()
        val svg = SVG.getFromString(svgString)
        svg.renderToCanvas(canvas)
    }

    fun getSvgString(): String{
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
        println(str)
        return str
    }
}
