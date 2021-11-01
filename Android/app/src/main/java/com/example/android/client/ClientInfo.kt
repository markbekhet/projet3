package com.example.android.client

object ClientInfo {
    var username:String ?= null
    var userInformation= UserProfileInformation()
    var userId = ""
    var usersList = UsersArrayList()
    var teamsList = TeamsArrayList()
}

class User(val id: String? = null,
           val status: Int?= null,
           val pseudo: String?= null){}

class Team(val id:Int?= null,
            val name:Int?= null,
            val visibility: Visibility){}

class UsersArrayList(val userList: ArrayList<User>? = null){}

class TeamsArrayList(val teamList: ArrayList<Team>?= null){}
