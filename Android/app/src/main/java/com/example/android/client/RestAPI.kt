package com.example.android.client

import com.example.android.profile
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface RestAPI {

    @POST(profile)
    suspend fun createProfile(@Body requestBody: RequestBody): Response<ResponseBody>

    @GET("$profile/{Id}")
    suspend fun getProfile(@Path("Id") userId: Int): Response<ResponseBody>

}
