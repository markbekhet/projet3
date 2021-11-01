package com.example.android.client

import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.example.android.url
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.Retrofit
import java.net.HttpURLConnection
import java.net.URL

class ClientService : Service() {
    var authentify:Int =0
    var userInfo : LoginInfo?= null


    override fun onBind(p0: Intent?): IBinder? {
        TODO("Not yet implemented")
    }
    ///This methods needs to be changed///

    suspend fun disconnect(){
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)

        withContext(Dispatchers.IO) {
            val response = service.disconnectUser(ClientInfo.userId)
            println(response)
        }

    }
    suspend fun getUserProfileInformation(){
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)

        withContext(Dispatchers.IO){
            val response =  service.getProfile(ClientInfo.userId)

            if (response!!.isSuccessful){
                var responseBody = response.body()?.string()
                val userInformation = ClientInfo.userInformation.fromJson(responseBody)
                ClientInfo.userInformation = userInformation
            }
        }
    }

    suspend fun createUser(userRegistration: UserRegistrationInfo): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)

        val requestBody = userRegistration.toJson().toRequestBody("application/json".toMediaTypeOrNull())
        var response: Response<ResponseBody>? = null
        withContext(Dispatchers.IO){
            response = service.createUser(requestBody)
            return@withContext response
        }
        return response
    }


    suspend fun login(userInfo: LoginInfo): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)
        val requestBody = userInfo.toJson().toRequestBody("application/json".toMediaTypeOrNull())
        var response: Response<ResponseBody>? = null
        withContext(Dispatchers.IO){
            response = service.login(requestBody)
            authentify = (response!!.code())
            println( (response!!.code()))
            return@withContext response
        }
        return response
    }

    suspend fun modifyProfile(modification: ProfileModification): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)
        val jsonString = modification.toJson()
        println(jsonString)
        val requestBody = jsonString.toRequestBody("application/json".toMediaTypeOrNull())
        var response: Response<ResponseBody>? = null
        println(ClientInfo.userId)
        withContext(Dispatchers.IO){
            response =
                    service.modifyProfileParams(ClientInfo.userId, requestBody)
            if(response != null){
                println(response!!.code())
            }
            return@withContext response
        }
        return response
    }

}
