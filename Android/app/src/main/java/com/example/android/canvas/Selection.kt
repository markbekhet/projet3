package com.example.android.canvas

import android.content.Context
import android.view.View
import com.example.android.client.ClientInfo
import org.apache.batik.anim.dom.SVGOMGElement
import org.apache.batik.dom.AbstractDocument
import org.w3c.dom.Element
import org.w3c.dom.svg.SVGElement

class Selection(private var drawingId: Int?, private var owner: AbstractDocument)
    : Tool, SVGOMGElement()
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
    override var userId: String? = ClientInfo.userId
    private var selectedTool: Tool? = null


    override fun touchStart(eventX: Float, eventY: Float, svgRoot: Element) {
        // Take the most recent element on the stack
        var i = svgRoot.childNodes.length - 1
        if(svgRoot.childNodes.length > 0){
            while(i >= 0){
                val tool = svgRoot.childNodes.item(i) as Tool
                if(tool.inTranslationZone(eventX, eventY)){
                    if(tool.userId == null ||
                        !(tool.selected && tool.userId != ClientInfo.userId)){
                        if (tool is FreeHand){
                            selectedTool = FreeHand(drawingId, pencilString, owner)
                        }
                        else if(tool is Ellipse){
                            selectedTool = Ellipse(drawingId, ellipseString, owner)
                        }
                        else{
                            selectedTool = Rectangle(drawingId, rectString, owner)
                        }
                        selectedTool!!.parse(tool.getOriginalString())
                        startTransformPoint.x = tool.startTransformPoint.x
                        startTransformPoint.y = tool.startTransformPoint.y
                        selectedTool!!.contentID = tool.contentID
                        selectedTool!!.select()
                    }

                    break
                }
                i--
            }
        }
    }

    override fun touchMove(context: Context, eventX: Float, eventY: Float) {
        //Not needed given the exception that will be made in the CanvasView
    }

    fun getSelectedTool(): Tool?{
        return selectedTool
    }
    override fun touchUp() {
        //setCriticalValues()
        if(selectedTool!=null){
            selectedTool!!.touchUp()
        }
        //calculateScalingPositions()
    }

    override fun getString(): String { return str}

    override fun getOriginalString(): String { return str}

    override fun inTranslationZone(eventX: Float, eventY: Float): Boolean {
        if(selectedTool != null){
            return selectedTool!!.inTranslationZone(eventX, eventY)
        }
        return false
    }

    override fun translate(view: View, translationPoint: Point) {
        if(selectedTool != null){
            selectedTool!!.translate(view, translationPoint)
        }
    }

    override fun scale(view: View, scalePoint: Point, direction: Point) {
        if(selectedTool != null){
            selectedTool!!.scale(view, scalePoint, direction)
        }
    }

    override fun getSelectionString() {}

    override fun calculateScalingPositions() {
        if(selectedTool != null){
            selectedTool!!.calculateScalingPositions()
        }
    }

    override fun getScalingPoint(point: Point): MutableMap.MutableEntry<Point, Point>? {
        if(selectedTool != null){
            return selectedTool!!.getScalingPoint(point)
        }
        return null
    }

    override fun getScalingPositionsString() {}

    override fun parse(parceableString: String?) {}

    override fun unselect() {
        if(selectedTool != null){
            selectedTool!!.unselect()
        }
    }

    override fun delete() {
        if(selectedTool != null){
            selectedTool!!.delete()
            selectedTool = null
        }
    }

    override fun updateThickness() {
        if(selectedTool != null){
            selectedTool!!.updateThickness()
        }
    }

    override fun updatePrimaryColor() {
        if(selectedTool != null){
            selectedTool!!.updatePrimaryColor()
        }
    }

    override fun updateSecondaryColor() {
        if(selectedTool != null){
            selectedTool!!.updateSecondaryColor()
        }
    }
    override fun select(){}
    override fun setCriticalValues() {
        if(selectedTool!= null){
            selectedTool!!.setCriticalValues()
        }
    }
}
