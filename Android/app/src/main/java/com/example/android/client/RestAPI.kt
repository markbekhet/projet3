package com.example.android.client

import com.example.android.login
import com.example.android.profile
import com.example.android.register
import com.example.android.user
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*
import java.net.ResponseCache

interface RestAPI {

    @POST(register)
    suspend fun createUser(@Body requestBody: RequestBody): Response<ResponseBody>

    @GET("$user$profile/{Id}")
    suspend fun getProfile(@Path("Id") userId: String): Response<ResponseBody>

    @PUT("$user$profile/{Id}")
    suspend fun modifyProfileParams(@Path("Id") userId: String,
                              @Body requestBody: RequestBody): Response<ResponseBody>
    @POST(login)
    suspend fun login(@Body requestBody: RequestBody): Response<ResponseBody>

}
