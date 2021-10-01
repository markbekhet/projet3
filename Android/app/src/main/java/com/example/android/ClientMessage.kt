package com.example.android

import com.google.gson.Gson
import org.json.JSONObject

data class ClientMessage(
    var clientName: String?,
    var message: String
){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

data class ServerMessage(
    var clientName: String ?= null,
    var message: String ?= null,
    var date: CustomDate ?= null
){
    fun fromJson(jsonObject:JSONObject): ServerMessage{
        clientName = jsonObject.getString("clientName")
        message = jsonObject.getString("message")
        date = CustomDate().fromJson(jsonObject.getJSONObject("date"))
        return ServerMessage(clientName,message, date)

    }
    override fun toString(): String{
        return "${clientName} ${message} ${date.toString()}"
    }
}

data class CustomDate(
    var hour: String = null,
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
}
