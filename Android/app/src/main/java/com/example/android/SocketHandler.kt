package com.example.android

import io.socket.client.IO
import io.socket.client.Socket
import java.lang.Exception
import java.lang.RuntimeException


const val URL = "http://10.200.41.34:3000"
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
