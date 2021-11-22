package com.example.android.chat

import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import com.example.android.R

var notification_ID = 0

fun NotificationManager.sendNotification(messageBody: String, applicationContext: Context){
    val builder = NotificationCompat.Builder(applicationContext,
        applicationContext.getString(R.string.color_image_notification_id) )
        .setSmallIcon(R.drawable.logo)
        .setContentTitle(applicationContext.getString(R.string.notification_title))
        .setContentText(messageBody)
    notify(notification_ID, builder.build())
}
