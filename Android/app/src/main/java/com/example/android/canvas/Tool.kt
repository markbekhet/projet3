package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.view.View
import org.w3c.dom.Document
import org.w3c.dom.Node
import org.w3c.dom.svg.SVGElement

interface Tool: SVGElement {
    var currentX: Float
    var currentY: Float
    var str: String
    var node: SVGElement
    fun touchStart(doc: Document, eventX: Float, eventY:Float)
    fun touchMove(view: View, context: Context,
                  eventX: Float, eventY: Float)
    fun touchUp()

    fun getString(): String
}
