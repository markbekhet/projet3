package com.example.android.chat

import com.google.gson.Gson
import org.json.JSONObject

// change the data structure to correspond to the server
// ClientMessage is the message received from the server
data class ClientMessage(
    var from: String?= null,
    var message: String? = null,
    var date: String?= null,
    var roomName: String?= null

){
    fun toJson(): String{
        return Gson().toJson(this)
    }

    fun fromJson(json: String): ClientMessage{
        return Gson().fromJson(json, ClientMessage::class.java)
    }
}

data class ClientMessageArray(var chatHistoryList: ArrayList<ClientMessage>?= null){
    fun fromJson(json:String): ClientMessageArray{
        return Gson().fromJson(json, ClientMessageArray::class.java)
    }
}

// The serverMessage is the message sent to the server
data class ServerMessage(
    var from: String ?= null,
    var message: String ?= null,
    var roomName: String ?= null
){
    fun fromJson(json:String): ServerMessage{
        return Gson().fromJson(json, ServerMessage::class.java)

    }
    /*override fun toString(): String{
        return "${clientName} ${message} ${date.toString()}"
    }*/
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

data class CustomDate(
    var hour: String ?= null,
    var minutes: String ?= null,
    var seconds: String ?= null
){
    fun fromJson(jsonObject: JSONObject): CustomDate{
        hour = jsonObject.getString("hour")
        minutes = jsonObject.getString("minutes")
        seconds = jsonObject.getString("seconds")
        return CustomDate(hour, minutes, seconds)
    }

    override fun toString(): String{
        return "${hour}:${minutes}:${seconds}"
    }

    fun toJson(): String{
        return Gson().toJson(this)
    }
}
