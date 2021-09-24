package com.example.android

import io.socket.client.IO
import io.socket.client.Socket
import java.lang.Exception
import java.lang.RuntimeException


private const val URL = "http://192.168.0.112:3000"
object SocketHandler {
    private lateinit var mSocket: Socket

    @Synchronized
    fun setSocket(){
        try{
            mSocket = IO.socket(URL)
        } catch (e: Exception) {
            println(e.message)
            throw RuntimeException(e)
        }
    }

    @Synchronized
    fun getMSocket(): Socket? {
        return mSocket
    }

    @Synchronized
    fun establishConnection(){
        mSocket.connect()
    }
}
