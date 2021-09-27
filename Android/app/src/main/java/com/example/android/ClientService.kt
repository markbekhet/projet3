package com.example.android

import android.app.Service
import android.content.Intent
import android.os.IBinder

class ClientService : Service() {
    override fun onBind(p0: Intent?): IBinder? {
        TODO("Not yet implemented")
    }
    fun setClientUsername(username_:String){
        ClientInfo.username = username_
    }


}
