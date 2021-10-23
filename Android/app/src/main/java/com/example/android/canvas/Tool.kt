package com.example.android.canvas

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.view.View
import org.w3c.dom.Document
import org.w3c.dom.Node
import org.w3c.dom.svg.SVGElement
import org.w3c.dom.svg.SVGTransform

var radius = 10
interface Tool: SVGElement{
    var currentX: Float
    var currentY: Float
    var str: String
    var selected: Boolean
    var startTransformPoint: Point
    var totalTranslation: Point
    var totalScaling: Point
    var scalingPositions: HashMap<Point, Point>
    //var drawingID: Int
    var contentID: Int?

    fun touchStart(view: View, eventX: Float, eventY:Float)
    fun touchMove(view: View, context: Context,
                  eventX: Float, eventY: Float)
    fun touchUp(view: View, selectedTools: ArrayList<Tool>)

    fun getString(): String
    fun getOriginalString()
    fun inTranslationZone(eventX: Float, eventY:Float): Boolean
    fun translate(view:View, translationPoint: Point)
    fun scale(view: View, scalePoint: Point, direction: Point)
    fun getSelectionString()
    fun calculateScalingPositions()
    fun getScalingPoint(point: Point):MutableMap.MutableEntry<Point, Point>?
    fun getScalingPositionsString()
    fun parse(parceableString: String?)
}
