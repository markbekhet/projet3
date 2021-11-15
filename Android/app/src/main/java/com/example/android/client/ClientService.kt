package com.example.android.client

import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.example.android.canvas.DeleteDrawingDt
import com.example.android.canvas.DrawingInformation
import com.example.android.team.CreateTeamDto
import com.example.android.team.DeleteTeamDto
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
    suspend fun getUserProfileInformation(otherId: String): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)

        var response: Response<ResponseBody>? = null
        withContext(Dispatchers.IO){
            response =  service.getProfile(ClientInfo.userId, otherId)
            return@withContext response
        }
        return response
    }

    suspend fun createDrawing(drawingInfo: DrawingInformation): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)

        val requestBody = drawingInfo.toJson().toRequestBody("application/json".toMediaTypeOrNull())
        var response: Response<ResponseBody>? = null
        withContext(Dispatchers.IO){
            response =  service.createDrawing(requestBody)
            return@withContext response
        }
        return response
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

    suspend fun createCollaborationTeam(team: CreateTeamDto): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)

        val requestBody = team.toJson().toRequestBody("application/json".toMediaTypeOrNull())
        var response: Response<ResponseBody>? = null
        withContext(Dispatchers.IO){
            response = service.createTeam(requestBody)
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


    suspend fun deleteTeam(team: DeleteTeamDto): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)
        val jsonString = team.toJson()
        println(jsonString)
        val requestBody = jsonString.toRequestBody("application/json".toMediaTypeOrNull())
        var response: Response<ResponseBody>? = null
        println(ClientInfo.userId)
        withContext(Dispatchers.IO){
            response =
                service.deleteTeam(requestBody)
            if(response != null){
                println(response!!.code())
            }
            return@withContext response
        }
        return response

    }
    suspend fun getUserGallery(): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)
        var response: Response<ResponseBody>? = null
        withContext(Dispatchers.IO){
            response = service.getGalleryDrawings(ClientInfo.userId)
            println( (response!!.code()))
            return@withContext response
        }
        return response
    }
    suspend fun modifyDrawings(): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)
        var response: Response<ResponseBody>? = null
        withContext(Dispatchers.IO){
            response = service.getGalleryDrawings(ClientInfo.userId)
            println( (response!!.code()))
            return@withContext response
        }
        return response
    }
    suspend fun deleteDrawings(deleteDrawing : DeleteDrawingDt): Response<ResponseBody>?{
        val retrofit = Retrofit.Builder()
            .baseUrl(url)
            .build()

        val service = retrofit.create(RestAPI::class.java)
        val jsonString = deleteDrawing.toJson()
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
