package com.example.android.canvas

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.android.R
import org.apache.batik.anim.dom.SVGDOMImplementation
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.svg.SVGElement

class CanvasActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        //setContentView(R.layout.activity_canvas)
        val canvas = CanvasView(this)
        setContentView(canvas)
        /*var impl = SVGDOMImplementation.getDOMImplementation()
        val svgNS = SVGDOMImplementation.SVG_NAMESPACE_URI
        val doc: Document = impl.createDocument(svgNS, "svg", null)
        // Get the root element (the 'svg' element).
        var svgRoot = doc.documentElement;

        // Set the width and height attributes on the root 'svg' element.
        svgRoot.setAttributeNS(null, "width", "400");
        svgRoot.setAttributeNS(null, "height", "450");

        // Create the rectangle.
        var rectangle = doc.createElementNS(svgNS, "rect");
        rectangle.setAttributeNS(null, "x", "10");
        rectangle.setAttributeNS(null, "y", "20");
        rectangle.setAttributeNS(null, "width", "100");
        rectangle.setAttributeNS(null, "height", "50");
        rectangle.setAttributeNS(null, "fill", "red");

        // Attach the rectangle to the root 'svg' element.
        svgRoot.appendChild(rectangle);*/
    }
}
