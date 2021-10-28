package com.example.android.canvas

class Point(var x: Float, var y: Float) {
    fun equals(point: Point): Boolean{
      return x == point.x && y == point.y
    }

    fun difference(point: Point): Point {
        return Point(point.x - x, point.y - y)
    }

    fun makeEqualTo(point: Point){
        x = point.x
        y = point.y
    }
}
