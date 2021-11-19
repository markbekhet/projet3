package com.example.android.client

import android.widget.ImageView
import com.example.android.R

object ClientInfo {
    var username:String ?= null
    var userId = ""
    var usersList = UsersArrayList()
    var teamsList = TeamsArrayList()
}

object avatarClientInfo{
    var avatarClient : Int = R.drawable.avatar
}
class User(val id: String? = null,
           val status: Int?= null,
           val pseudo: String?= null){}

class Team(val id:Int?= null,
            val name:String?= null,
            val visibility: Int?=null){}

class UsersArrayList(val userList: ArrayList<User>? = null){}

class TeamsArrayList(val teamList: ArrayList<Team>?= null){}
