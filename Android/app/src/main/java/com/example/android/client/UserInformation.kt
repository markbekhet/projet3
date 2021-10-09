package com.example.android.client

import com.google.gson.Gson

enum class Status{
    ONLINE, BUSY, OFFLINE
}

data class UserProfileInformation(
    var id: Int? = null,
    var firstName: String? = null,
    var lastName: String? = null,
    var pseudo: String? = null,
    var emailAddress: String? = null,
    var nbAuthorDrawings: String? = null,
    var nbCollaborationDrawings: String? = null,
    private var connectionHistories: ArrayList<ConnectionDisconnectionHistories> ?= null,
    private var disconnectionHistories: ArrayList<ConnectionDisconnectionHistories> ?= null,
){
    fun fromJson(information: String?): UserProfileInformation{
        return Gson().fromJson(information, UserProfileInformation::class.java)
    }

    fun getConnectionHistory(): ArrayList<ConnectionDisconnectionHistories>?{
        return connectionHistories
    }

    fun getDisconnectionHistory(): ArrayList<ConnectionDisconnectionHistories>?{
        return disconnectionHistories
    }
}

data class ConnectionDisconnectionHistories(
    var id: Int? = null,
    var date: String? = null
)

data class UserRegistrationInfo(
    var firstName: String? = null,
    var lastName: String? = null,
    var pseudo: String? = null,
    var emailAddress: String? = null,
    var password: String? = null,
    var passwordConfirm: String? = null
){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}
