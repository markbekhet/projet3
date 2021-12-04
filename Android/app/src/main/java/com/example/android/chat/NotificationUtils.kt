package com.example.android.chat

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationCompat
import com.example.android.LandingPage
import com.example.android.MainActivity
import com.example.android.R

var notification_ID = 0

fun NotificationManager.sendNotification(messageBody: String, applicationContext: AppCompatActivity){
    val builder = NotificationCompat.Builder(applicationContext,
        applicationContext.getString(R.string.color_image_notification_id) )
        .setSmallIcon(R.drawable.logo)
        .setContentTitle(applicationContext.getString(R.string.notification_title))
        .setContentText(messageBody)
        .setAutoCancel(true)
    notify(notification_ID, builder.build())
    notification_ID++
}

fun NotificationManager.cancelNotifications() {
    cancelAll()
}
