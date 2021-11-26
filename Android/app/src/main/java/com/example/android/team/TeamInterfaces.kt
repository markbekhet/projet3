package com.example.android.team

import com.example.android.canvas.ReceiveDrawingInformation
import com.example.android.chat.ClientMessage
import com.example.android.client.ActiveUser
import com.google.gson.Gson

class CreateTeamDto(var name: String?= null,
                    var visibility: Int?= null,
                    var ownerId: String?= null,
                    var password: String?= null,
                    var nbCollaborators: Int?= null,
                    var bio:String= "")
{
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

class TeamGeneralInformation(
    var id: String?= null,
    var visibility: Int?= null,
    var name: String?= null,
    var password: String?= null,
    var ownerId: String?= null,
    var bio: String= ""
){
    fun fromJson(json: String): TeamGeneralInformation{
        return Gson().fromJson(json, TeamGeneralInformation::class.java)
    }

    fun toJson(): String{
        return Gson().toJson(this)
    }
}

class TeamChatAndActiveUsers(
    var activeUsers: ArrayList<ActiveUser> = ArrayList(),
    var chatHistoryList: ArrayList<ClientMessage> = ArrayList(),
    var drawingList: ArrayList<ReceiveDrawingInformation> = ArrayList()
){
    fun fromJson(json:String): TeamChatAndActiveUsers{
        return Gson().fromJson(json, TeamChatAndActiveUsers::class.java)
    }
}


class DeleteTeamDto(var teamId: String?= null, var userId: String?= null){
    fun toJson():String{
        return Gson().toJson(this)
    }
}

class LeaveTeamDto(
    var teamName:String?= null,
    var userId:String?= null
){
    fun toJson():String{
        return Gson().toJson(this)
    }
}

class JoinTeamDto(
    var teamName: String?= null,
    var userId: String?= null,
    var password: String?= null){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

class CantJoin(
    var message: String = ""
){
    fun fromJson(json: String): CantJoin{
        return Gson().fromJson(json, CantJoin::class.java)
    }
}

class GetGalleryTeam(var teamName: String){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}


