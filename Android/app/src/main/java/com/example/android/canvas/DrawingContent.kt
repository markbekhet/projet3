package com.example.android.canvas

import com.google.gson.Gson
import com.google.gson.JsonObject
import org.json.JSONObject

enum class DrawingStatus(var int: Int){
    InProgress(0), Done(1), Selected(2), Deleted(3)
}
data class ContentDrawingSocket(
    var drawingId: Int? = null,
    var userId: String? = null,
    var id: Int? = null,
    var content: String? = null,
    var status: DrawingStatus? = null,
    var toolName: String? = null
){
    fun toJson(): String{
        println(Gson().toJson(this))
        return Gson().toJson(this)
    }

    fun fromJson(json: String): ContentDrawingSocket {
        return Gson().fromJson(json, ContentDrawingSocket::class.java)
    }
}

data class RequestCreation(
    private var drawingId: Int? = null
){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

data class GetContentId(
    var contentId:Int?= null
)
{
    fun fromJson(json: String): GetContentId{
            return Gson().fromJson(json, GetContentId::class.java)
    }
}
