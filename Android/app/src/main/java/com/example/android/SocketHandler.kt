package com.example.android

import io.socket.client.IO
import io.socket.client.Socket
import java.lang.Exception
import java.lang.RuntimeException


object SocketHandler {
    private lateinit var chatSocket: Socket
    private lateinit var drawingSocket: Socket

    @Synchronized
    fun setChatSocket(){
        try{
            chatSocket = IO.socket(url)
        } catch (e: Exception) {
            println(e.message)
            throw RuntimeException(e)
        }
    }

    @Synchronized
    fun getChatSocket(): Socket? {
        return chatSocket
    }

    @Synchronized
    fun establishChatSocketConnection(){
        chatSocket.connect()
    }

    /*@Synchronized
    fun setDrawingSocket(){
        try{
            drawingSocket = IO.socket(url + drawingNamespace)
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
    }*/
}
