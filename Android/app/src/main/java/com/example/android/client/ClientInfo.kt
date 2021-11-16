package com.example.android.client

import com.example.android.team.TeamGeneralInformation
import com.google.gson.Gson

object ClientInfo {
    var username:String ?= null
    var userId = ""
    var usersList = UsersArrayList()
    var teamsList = TeamsArrayList()
}

class User(val id: String? = null,
           val status: Int?= null,
           val pseudo: String?= null){
    fun fromJson(json: String): User{
        return Gson().fromJson(json, User::class.java)
    }
}

class UsersArrayList(val userList: ArrayList<User>? = null){}

class TeamsArrayList(val teamList: ArrayList<TeamGeneralInformation> = ArrayList()){}
