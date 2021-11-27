package com.example.android.client

import com.google.gson.Gson

fun clientStatusFroInt(int:Int): ClientStatus{
    when(int){
        0 -> return ClientStatus.ONLINE
        1 -> return ClientStatus.BUSY
        else -> return ClientStatus.OFFLINE
    }
}

enum class ClientStatus(var int: Int, var string: String){
    ONLINE(0, "en ligne"),
    BUSY(1, "Occupée"),
    OFFLINE(2, "hors ligne")
}

data class UserProfileRequest(val userId: String, val visitedId: String){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}
data class UserProfileInformation(
    var firstName: String? = null,
    var lastName: String? = null,
    var pseudo: String? = null,
    var status: Int?= null,
    var emailAddress: String? = null,
    var averageCollaborationTime: Float? = null,
    var totalCollaborationTime: Float? = null,
    var numberCollaborationTeams: Int? = null,
    var numberCollaboratedDrawings: Int? = null,
    var numberAuthoredDrawings: Int? = null,
    var avatar : String? = null,
    private var connectionHistories: ArrayList<ConnectionDisconnectionHistories> ?= null,
    private var disconnectionHistories: ArrayList<ConnectionDisconnectionHistories> ?= null,
    private var drawingEditionHistories: ArrayList<DrawingEditionHistories> ?= null
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

    fun getDrawingHistories(): ArrayList<DrawingEditionHistories>?{
        return drawingEditionHistories
    }
}

data class ConnectionDisconnectionHistories(
    var id: Int? = null,
    var date: String? = null
)

data class DrawingEditionHistories(
    var id: Int? = null,
    var drawingStae: Int? = null,
    var action: String? = null,
    var drawingName: String?= null,
    var drawingId: Int?= null,
    var drawingVisibility: Int?= null,
    var date: String? = null
)

enum class DrawingAvailability(var i: Int){
    AVAILABLE(0),
    DELETED(1)
}

data class ActiveUser(var userId:String?= null,
                      var teamName:String?=null,
                      var drawingId:Int?= null){
    fun fromJson(json:String): ActiveUser{
        return Gson().fromJson(json, ActiveUser::class.java)
    }
}

data class UserRegistrationInfo(
    var firstName: String? = null,
    var lastName: String? = null,
    var pseudo: String? = null,
    var emailAddress: String? = null,
    var password: String? = null,
    var avatar : String? = null
){
    fun toJson(): String{
        return Gson().toJson(this)
    }

}

data class LoginInfo(var username: String? = null, var password: String? = null)
{
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

data class ProfileModification(
    var newPassword: String? = null,
    var newPseudo: String? = null,
    var avatar : String? = null,
    var oldPassword: String? = null
){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}
