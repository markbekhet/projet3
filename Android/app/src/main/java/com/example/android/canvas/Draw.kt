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

class ReceiveDrawingInformation(
    var id: Int?= null,
    var ownerId: String? = null,
    var bgColor:String?= null,
    var height: Int?= null,
    var width: Int?= null,
    var visibility: Int?= null,
    var name: String?= null,
    var contents: ArrayList<ContentDrawingSocket> = ArrayList<ContentDrawingSocket>()
){
    fun fromJson(json: String): ReceiveDrawingInformation{
        return Gson().fromJson(json, ReceiveDrawingInformation::class.java)
    }
}

class GalleryDrawing(var drawingList: ArrayList<ReceiveDrawingInformation>?= null){
    fun fromJson(json:String): GalleryDrawing{
        return Gson().fromJson(json, GalleryDrawing::class.java)
    }
}
// This class encapsulates all the details needed for the chat,
// drawing informations and connected users for a given drawing
class AllDrawingInformation(
    var drawing: ReceiveDrawingInformation?= null
){
    fun fromJson(json: String): AllDrawingInformation{
        return Gson().fromJson(json, AllDrawingInformation::class.java)
    }
}

class JoinDrawingDto(var drawingId:Int,
                     var userId: String, var password:String?=null){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

class LeaveDrawingDto(var drawingId:Int, var userId:String){
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
