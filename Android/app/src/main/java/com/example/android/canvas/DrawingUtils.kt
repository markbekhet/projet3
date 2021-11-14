package com.example.android.canvas

var pencilString = "pencil"
var rectString = "rect"
var ellipseString = "ellipse"
var black = "#000000"
var none = "none"
var selectionString = "selection"

object DrawingUtils {
    var currentTool = pencilString
    var primaryColor = black
    var secondaryColor = none
    var thickness = 3
    var currentDrawingId = 0
    var drawingInformation: AllDrawingInformation?= null
}


