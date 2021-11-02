package com.example.android.client

class Draw (visible:String, password: String,owner: String,height:Int,Width:Int,name:String,privateInfo:Boolean, color:String){
    var visibility:String = visible
    var password : String = password
    var ownerId: String = owner
    var height :Int = height
    var witdh :Int = Width
    var name :String = name
    var useOwnerPrivateInformation: Boolean = privateInfo
    var color : String = color


}

enum class Visibility {
    public,
    privee,
    proteger
}
