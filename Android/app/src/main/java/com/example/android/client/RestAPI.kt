package com.example.android.client

import com.example.android.*
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*
import java.net.ResponseCache

interface RestAPI {

    @POST(register)
    suspend fun createUser(@Body requestBody: RequestBody): Response<ResponseBody>

    @GET("$user$profile/{Id}/{otherId}")
    suspend fun getProfile(@Path("Id") userId: String,
                           @Path("otherId") otherUserId:String): Response<ResponseBody>

    @PUT("$user$profile/{Id}")
    suspend fun modifyProfileParams(@Path("Id") userId: String,
                              @Body requestBody: RequestBody): Response<ResponseBody>
    @POST(login)
    suspend fun login(@Body requestBody: RequestBody): Response<ResponseBody>

    @POST("$user$disconnect/{Id}")
    suspend fun disconnectUser(@Path("Id") userId:String): Response<ResponseBody>

    @POST("$drawingNamespace")
    suspend fun createDrawing(@Body requestBody: RequestBody): Response<ResponseBody>

    @POST("$collaborationTeam")
    suspend fun createTeam(@Body requestBody: RequestBody): Response<ResponseBody>

    @HTTP(method = "DELETE",path = "$collaborationTeam", hasBody = true)
    suspend fun deleteTeam(@Body requestBody: RequestBody): Response<ResponseBody>

    @GET("$user/gallery/{Id}")
    suspend fun getGalleryDrawings(@Path("Id") userId: String): Response<ResponseBody>

    @HTTP(method = "DELETE",path="$drawingNamespace", hasBody = true)
    suspend fun deleteDrawing(@Body requestBody: RequestBody): Response<ResponseBody>

}
