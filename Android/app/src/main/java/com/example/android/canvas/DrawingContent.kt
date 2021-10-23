package com.example.android.canvas

import com.google.gson.Gson
import com.google.gson.JsonObject
import org.json.JSONObject

enum class DrawingStatus{
    InProgress, Done, Selected, Deleted
}
data class DrawingContent(
    var drawingId: Int? = null,
    private var userId: String? = null,
    var contentId: Int? = null,
    var drawing: String? = null,
    var status: DrawingStatus? = null
){
    fun toJson(): String{
        return Gson().toJson(this)
    }

    fun fromJson(json: String): DrawingContent{
        return Gson().fromJson(json, DrawingContent::class.java)
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
    var contentId:Int
)
{
    fun fromJson(json: String): GetContentId{
            return Gson().fromJson(json, GetContentId::class.java)
    }
}
