package com.example.android.canvas

import com.google.gson.Gson

class DrawingInformation (
    var visibility:Int? = null,
    var password: String?= null,
    var ownerId: String?= null,
    var height:Int?= null,
    var width:Int?= null,
    var name:String?= null,
    var color:String? = null){
    fun toJson(): String{
        return Gson().toJson(this)
    }

}

enum class Visibility(var int: Int){
    publicVisibility(0),
    protectedVisibility(1),
    privateVisibility(2);

    fun getVisibilityFromInt(int:Int): Visibility{
        if(int == 0){
            return publicVisibility
        }else if(int == 1){
            return protectedVisibility
        }
        else{
            return privateVisibility
        }
    }
}
