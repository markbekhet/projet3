package com.example.android.client

import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.example.android.URL
import com.example.android.localUrl
import com.example.android.profile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Response
import retrofit2.Retrofit
import java.lang.Exception
import java.net.HttpURLConnection
import java.net.URL

class ClientService : Service() {
    var authentify:Int =0
    var userInfo : LoginInfo?= null


    override fun onBind(p0: Intent?): IBinder? {
        TODO("Not yet implemented")
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
            val response = ClientInfo.userInformation.id?.let { service.getProfile(it) }

            if (response!!.isSuccessful){
                var responseBody = response.body()?.string()
                val userInformation = ClientInfo.userInformation.fromJson(responseBody)
                ClientInfo.userInformation = userInformation
            }
        }
    }

    suspend fun createUser(userRegistration: UserRegistrationInfo): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(localUrl)
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
            .baseUrl(localUrl)
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

    suspend fun modifyProfile(jsonObject: JSONObject): Response<ResponseBody>?{
        val requestBody = jsonObject.toString()
            .toRequestBody("application/json".toMediaTypeOrNull())
        var response: Response<ResponseBody>? = null

        response = ClientInfo.userInformation.id?.
        let { service.modifyProfile(it, requestBody) }
        return response
    }

}
