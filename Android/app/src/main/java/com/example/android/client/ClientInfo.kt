package com.example.android.client

import com.example.android.team.TeamGeneralInformation

object ClientInfo {
    var username:String ?= null
    var userId = ""
    var usersList = UsersArrayList()
    var teamsList = TeamsArrayList()
}

class User(val id: String? = null,
           val status: Int?= null,
           val pseudo: String?= null){}

class UsersArrayList(val userList: ArrayList<User>? = null){}

class TeamsArrayList(val teamList: ArrayList<TeamGeneralInformation>?= null){}
