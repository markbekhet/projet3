package com.example.android

import io.socket.client.IO
import io.socket.client.Socket
import java.lang.Exception
import java.lang.RuntimeException


object SocketHandler {
    private lateinit var chatSocket: Socket
    private lateinit var drawingSocket: Socket

    @Synchronized
    fun setSocket(){
        try{
            chatSocket = IO.socket(localUrl)
        } catch (e: Exception) {
            println(e.message)
            throw RuntimeException(e)
        }
    }

    @Synchronized
    fun getMSocket(): Socket? {
        return chatSocket
    }

    @Synchronized
    fun establishConnection(){
        chatSocket.connect()
    }

    @Synchronized
    fun setDrawingSocket(){
        try{
            drawingSocket = IO.socket(localUrl + drawingNamespace)
        } catch (e: Exception) {
            println(e.message)
            throw RuntimeException(e)
        }
    }

    @Synchronized
    fun getDrawingSocket(): Socket {
        return drawingSocket
    }

    @Synchronized
    fun establishDrawingSocketConnection(){
        drawingSocket.connect()
    }
}
