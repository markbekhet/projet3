package com.example.android.canvas

import android.content.Context
import android.view.View
import org.w3c.dom.Element
import org.w3c.dom.svg.SVGElement

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

    fun touchStart(eventX: Float, eventY:Float, svgRoot: Element)
    fun touchMove(context: Context, eventX: Float, eventY: Float)
    fun touchUp()

    fun getString(): String
    fun getOriginalString(): String
    fun inTranslationZone(eventX: Float, eventY:Float): Boolean
    fun translate(view:View, translationPoint: Point)
    fun scale(view: View, scalePoint: Point, direction: Point)
    fun getSelectionString()
    fun calculateScalingPositions()
    fun getScalingPoint(point: Point):MutableMap.MutableEntry<Point, Point>?
    fun getScalingPositionsString()
    fun parse(parceableString: String?)
    fun unselect()
    fun delete(svgRoot: Element)
    fun updateThickness()
    fun updatePrimaryColor()
    fun updateSecondaryColor()
    fun select()
    fun setCriticalValues()
}
