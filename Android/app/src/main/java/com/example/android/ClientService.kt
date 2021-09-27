package com.example.android

import android.app.Service
import android.content.Intent
import android.os.IBinder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class ClientService : Service() {
    var authentify:Int =0
    override fun onBind(p0: Intent?): IBinder? {
        TODO("Not yet implemented")
    }
    fun setClientUsername(username_:String){
        ClientInfo.username = username_
    }

    suspend fun disconnect(username:String){
        withContext(Dispatchers.IO){
            val endpoint: String = "/connection/disconnect/${username}"
            val mURL = URL(URL+endpoint)

            with(mURL.openConnection() as HttpURLConnection) {
                // optional default is GET
                requestMethod = "POST"

                println("URL : $url")
                println("Response Code : $responseCode")
            }
        }
    }
    suspend fun connect(username:String?){
        withContext(Dispatchers.IO){
            val endpoint: String = "/connection/connect/${username}"
            val mURL = URL(URL+endpoint)

            with(mURL.openConnection() as HttpURLConnection) {
                // optional default is GET
                requestMethod = "POST"

                println("URL : $url")
                println("Response Code : $responseCode")
                authentify = responseCode.toInt()
            }
        }
    }

}
