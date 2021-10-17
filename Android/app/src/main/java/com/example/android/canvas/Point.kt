package com.example.android.canvas

class Point(var x: Float, var y: Float) {
    fun equals(point: Point): Boolean{
      return x == point.x && y == point.y
    }
}
