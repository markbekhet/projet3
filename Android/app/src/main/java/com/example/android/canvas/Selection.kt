package com.example.android.canvas

import android.content.Context
import android.view.View
import org.apache.batik.anim.dom.SVGOMGElement
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Element
import org.w3c.dom.svg.SVGElement

class Selection: Tool, SVGOMGElement()
{
    override var currentX = 0f
    override var currentY = 0f
    override var str = ""
    override var selected = false
    override var startTransformPoint = Point(0f,0f)
    override var totalTranslation = Point(0f,0f)
    override var totalScaling = Point(0f,0f)
    override var scalingPositions = HashMap<Point, Point>()
    override var contentID: Int? = null

    override fun touchStart(eventX: Float, eventY: Float, svgRoot: Element) {
    }

    override fun touchMove(context: Context, eventX: Float, eventY: Float) {
    }

    override fun touchUp() {
    }

    override fun getString(): String { return str}

    override fun getOriginalString(): String { return str}

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean {
        return false
    }

    override fun translate(view: View, translationPoint: Point) {
    }

    override fun scale(view: View, scalePoint: Point, direction: Point) {
    }

    override fun getSelectionString() {
    }

    override fun calculateScalingPositions() {
    }

    override fun getScalingPoint(point: Point): MutableMap.MutableEntry<Point, Point>? {
        return null
    }

    override fun getScalingPositionsString() {}

    override fun parse(parceableString: String?) {}

    override fun unselect() {}

    override fun delete() {}

    override fun updateThickness() {}

    override fun updatePrimaryColor() {}

    override fun updateSecondaryColor() {}
}
