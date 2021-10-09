package com.example.android.client

import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.example.android.URL
import com.example.android.localUrl
import com.example.android.profile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import retrofit2.Retrofit
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
    ///This methods needs to be changed///

    suspend fun disconnect(username:String?){
        withContext(Dispatchers.IO){
            val endpoint: String = "/connection/disconnect/${username}"
            val mURL = URL(URL +endpoint)

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
            val mURL = URL(URL +endpoint)

            with(mURL.openConnection() as HttpURLConnection) {
                // optional default is GET
                requestMethod = "POST"

                println("URL : $url")
                println("Response Code : $responseCode")
                authentify = responseCode.toInt()
            }
        }
    }

    suspend fun getUserProfileInformation(){
        val retrofit = Retrofit.Builder()
            .baseUrl(localUrl)
            .build()

        val service = retrofit.create(RestAPI::class.java)

        withContext(Dispatchers.IO){
            val response = service.getProfile(1)

            if (response.isSuccessful){
                var responseBody = response.body()?.string()
                val userInformation = ClientInfo.userInformation.fromJson(responseBody)
                ClientInfo.userInformation = userInformation
            }
        }
    }

    suspend fun createUser(){
        withContext(Dispatchers.IO){

        }
    }

}
