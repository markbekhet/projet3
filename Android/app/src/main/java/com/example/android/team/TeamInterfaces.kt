package com.example.android.team

import com.google.gson.Gson

class CreateTeamDto(var name: String?= null,
                    var visibility: Int?= null,
                    var ownerId: String?= null,
                    var password: String?= null,
                    var nbCollaborators: Int?= null)
{
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

class TeamGeneralInformation(
    var id: String?= null,
    var visibility: Int?= null,
    var name: String?= null,
    var password: String?= null
){
    fun fromJson(json: String): TeamGeneralInformation{
        return Gson().fromJson(json, TeamGeneralInformation::class.java)
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


