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
    private val backgroundColor = ResourcesCompat.getColor(resources, R.color.white
        ,null)

    private val drawColor = ResourcesCompat.getColor(resources, R.color.black, null)

    private val paint = Paint().apply {
        color = drawColor
        // Smooths out edges of what is drawn without affecting shape.
        isAntiAlias = true
        // Dithering affects how colors with higher-precision than the device are down-sampled.
        isDither = true
        style = Paint.Style.STROKE // default: FILL
        strokeJoin = Paint.Join.ROUND // default: MITER
        strokeCap = Paint.Cap.ROUND // default: BUTT
        strokeWidth = STROKE_WIDTH // default: Hairline-width (really thin)
    }

    private var impl = SVGDOMImplementation.getDOMImplementation()
    private val doc: Document= impl.createDocument(svgNS, "svg", null)
    // Get the root element (the 'svg' element).
    private var svgRoot = doc.createElementNS(svgNS, "g")


    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(event: MotionEvent?): Boolean {
        when(event?.action){
            MotionEvent.ACTION_DOWN -> {
                tool = FreeHand("path", doc as AbstractDocument)
                tool.touchStart(doc, event.x, event.y)
                svgRoot.appendChild(tool)
            }
            MotionEvent.ACTION_MOVE -> tool.touchMove(this, context,
                event!!.x, event!!.y, paint)
            MotionEvent.ACTION_UP -> tool.touchUp()
        }

        return true
    }

    fun drawRandomRect(){
        var rectangle = doc.createElementNS(svgNS, "rect");
        rectangle.setAttributeNS(null, "x", "10");
        rectangle.setAttributeNS(null, "y", "20");
        rectangle.setAttributeNS(null, "width", "100");
        rectangle.setAttributeNS(null, "height", "50");
        rectangle.setAttributeNS(null, "fill", "red");

        // Attach the rectangle to the root 'svg' element.
        svgRoot.appendChild(rectangle);
        invalidate()
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        /*if(::bitmap.isInitialized) bitmap.recycle()
        bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        canvas = Canvas(bitmap)
        canvas.drawColor(backgroundColor)*/
        svgRoot.setAttribute("width", w.toString())
        svgRoot.setAttribute("height", h.toString())
        width = w.toString()
        height = h.toString()
    }

    override fun onDraw(canvas: Canvas?) {
        super.onDraw(canvas)
        /*canvas?.drawColor(backgroundColor)
        canvas?.drawBitmap(bitmap, 0f, 0f, null)*/
        var width1 = svgRoot.getAttribute("width")
        var height1 = svgRoot.getAttribute("height")
        val svgString = getSvgString()
        val svg = SVG.getFromString(svgString)
        svg.renderToCanvas(canvas)
    }

    fun getSvgString(): String{
        var str = "<svg width=\"${width}\" height=\"${height}\">\n"
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
