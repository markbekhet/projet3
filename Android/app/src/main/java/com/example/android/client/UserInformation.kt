package com.example.android.client

import com.google.gson.Gson

enum class Status{
    ONLINE, BUSY, OFFLINE
}

data class UserProfileInformation(
    var id: String? = null,
    var firstName: String? = null,
    var lastName: String? = null,
    var pseudo: String? = null,
    var emailAddress: String? = null,
    var averageCollaborationTime: Int? = null,
    var totalCollaborationTime: Int? = null,
    var numberCollaborationTeams: Int? = null,
    var numberCollaboratedDrawings: Int? = null,
    var numberAuthoredDrawings: Int? = null,
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
){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}
